import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArguments(): { name: string } {
  const args = process.argv.slice(2);
  let name: string | undefined;

  for (const arg of args) {
    if (arg.startsWith("--name=")) {
      name = arg.split("=")[1];
    }
  }

  if (!name) {
    console.error("--name is required (e.g. --name=add_playlist_columns)");
    process.exit(1);
  }

  return { name };
}

function getDatePrefix(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const boilerplate = (name: string) => `import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // TODO: implement ${name} migration
}

export async function down(db: Kysely<any>): Promise<void> {
  // TODO: implement ${name} rollback
}
`;

function main() {
  const { name } = parseArguments();
  const migrationsDir = path.join(__dirname, "..", "src", "migrations");
  const prefix = getDatePrefix();
  const fileName = `${prefix}_${name}.ts`;
  const filePath = path.join(migrationsDir, fileName);

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  fs.writeFileSync(filePath, boilerplate(name));
  console.log(`Created: tools/migrations/${fileName}`);
}

main();
