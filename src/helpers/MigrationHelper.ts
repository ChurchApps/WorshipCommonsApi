import * as fs from "fs";
import * as path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Migrator, type Migration, type MigrationProvider } from "kysely";
import { getDb } from "../db";

// scans the sibling migrations folder — src/migrations under tsx, dist/migrations in the built Lambda
class SiblingMigrationProvider implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    const folder = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "migrations");
    const migrations: Record<string, Migration> = {};
    const files = fs.readdirSync(folder).filter(f => (f.endsWith(".ts") || f.endsWith(".js")) && !f.endsWith(".d.ts")).sort();
    for (const file of files) {
      const mod = await import(pathToFileURL(path.join(folder, file)).href);
      migrations[file.replace(/\.(ts|js)$/, "")] = mod;
    }
    return migrations;
  }
}

export class MigrationHelper {
  static async migrateToLatest() {
    const migrator = new Migrator({ db: getDb() as any, provider: new SiblingMigrationProvider() });
    const { error, results } = await migrator.migrateToLatest();
    if (error) throw error instanceof Error ? error : new Error(String(error));
    return (results || []).map(r => ({ name: r.migrationName, status: r.status }));
  }
}
