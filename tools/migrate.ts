import * as path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Migrator, type Migration, type MigrationProvider } from "kysely";
import * as fs from "fs";
import { ensureEnvironment, createKysely, ensureDatabaseExists } from "./kysely-config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Action = "up" | "down" | "status";

function parseArguments(): { action: Action } {
  const args = process.argv.slice(2);
  let action: Action = "up";

  for (const arg of args) {
    if (arg.startsWith("--action=")) {
      const val = arg.split("=")[1];
      if (!["up", "down", "status"].includes(val)) {
        console.error(`Invalid action: ${val}. Use up, down, or status.`);
        process.exit(1);
      }
      action = val as Action;
    }
  }

  return { action };
}

// kysely's FileMigrationProvider hands raw Windows paths to import(); use file:// URLs
class WindowsSafeMigrationProvider implements MigrationProvider {
  constructor(private folder: string) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const files = fs.readdirSync(this.folder).filter(f => f.endsWith(".ts") || f.endsWith(".js")).sort();
    for (const file of files) {
      const mod = await import(pathToFileURL(path.join(this.folder, file)).href);
      migrations[file.replace(/\.(ts|js)$/, "")] = mod;
    }
    return migrations;
  }
}

async function getMigrator() {
  const migrationsPath = path.join(__dirname, "..", "src", "migrations");

  const db = createKysely();
  const migrator = new Migrator({
    db,
    provider: new WindowsSafeMigrationProvider(migrationsPath)
  });

  return { db, migrator };
}

async function migrateUp() {
  console.log("Ensuring database exists...");
  await ensureDatabaseExists();

  const { db, migrator } = await getMigrator();

  try {
    console.log("Running migrations...");
    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((r) => {
      if (r.status === "Success") {
        console.log(`  Applied: ${r.migrationName}`);
      } else if (r.status === "Error") {
        console.error(`  Failed: ${r.migrationName}`);
      }
    });

    if (error) {
      console.error("Migration failed:", error);
      throw error;
    }

    if (!results?.length) {
      console.log("  Already up to date.");
    }
  } finally {
    await db.destroy();
  }
}

async function migrateDown() {
  const { db, migrator } = await getMigrator();

  try {
    console.log("Rolling back last migration...");
    const { error, results } = await migrator.migrateDown();

    results?.forEach((r) => {
      if (r.status === "Success") {
        console.log(`  Reverted: ${r.migrationName}`);
      } else if (r.status === "Error") {
        console.error(`  Revert failed: ${r.migrationName}`);
      }
    });

    if (error) {
      console.error("Rollback failed:", error);
      throw error;
    }

    if (!results?.length) {
      console.log("  No migrations to revert.");
    }
  } finally {
    await db.destroy();
  }
}

async function migrateStatus() {
  const { db, migrator } = await getMigrator();

  try {
    const migrations = await migrator.getMigrations();
    console.log("\nMigration status:");
    for (const m of migrations) {
      const status = m.executedAt ? `Applied (${m.executedAt.toISOString()})` : "Pending";
      console.log(`  ${m.name}: ${status}`);
    }
    if (migrations.length === 0) {
      console.log("  No migrations found.");
    }
  } finally {
    await db.destroy();
  }
}

async function main() {
  const { action } = parseArguments();

  try {
    await ensureEnvironment();

    switch (action) {
      case "up":
        await migrateUp();
        break;
      case "down":
        await migrateDown();
        break;
      case "status":
        await migrateStatus();
        break;
    }

    console.log("\nDone.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
