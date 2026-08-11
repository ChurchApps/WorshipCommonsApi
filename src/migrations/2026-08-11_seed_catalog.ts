import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Data migration: load the launch catalog into an empty environment.
// No-ops when songs already exist (local dev seeds via tools/seed.ts instead).
export async function up(db: Kysely<any>): Promise<void> {
  const existing = await db.selectFrom("songs").select("id").limit(1).execute();
  if (existing.length > 0) return;

  // midi columns arrive in 2026-08-11_tune_midis, which also fills their values
  const { rows } = buildCatalog(Environment.contentRoot);
  const inserts = rows.map(({ midiUrl, midiBytes, ...r }) => r);
  for (let i = 0; i < inserts.length; i += 50) {
    await db.insertInto("songs").values(inserts.slice(i, i + 50)).execute();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const { rows } = buildCatalog(Environment.contentRoot);
  const ids = rows.map(r => r.id);
  await db.deleteFrom("songs").where("id", "in", ids).execute();
}
