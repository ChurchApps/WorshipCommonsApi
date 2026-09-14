import { type Kysely, sql } from "kysely";
import { buildCatalog, songInsert } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Custom writer grants (e.g. larry-holder) are longer than PD/WC. Widen license
// (idempotent if 2026-09-03 already did) then insert any catalog id still missing.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE songs MODIFY COLUMN license varchar(32)`.execute(db);

  const { rows } = buildCatalog(Environment.contentRoot);
  const existing = await db.selectFrom("songs").select("id").where("id", "in", rows.map(r => r.id)).execute();
  const have = new Set(existing.map((r: { id: string }) => r.id));
  const missing = rows.filter(r => !have.has(r.id)).map(songInsert);
  for (let i = 0; i < missing.length; i += 50) {
    await db.insertInto("songs").values(missing.slice(i, i + 50)).execute();
  }
}

export async function down(): Promise<void> { /* license width and inserts stay */ }
