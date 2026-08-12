import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Inserts any catalog song missing from the songs table — heals environments
// whose seed predates later seed-data additions (prod was missing the 2026-08-11
// Spanish imports). Existing rows are never touched.
export async function up(db: Kysely<any>): Promise<void> {
  const { rows } = buildCatalog(Environment.contentRoot);
  const existing = await db.selectFrom("songs").select("id").where("id", "in", rows.map(r => r.id)).execute();
  const have = new Set(existing.map((r: any) => r.id));
  const missing = rows.filter(r => !have.has(r.id));
  for (let i = 0; i < missing.length; i += 50) {
    await db.insertInto("songs").values(missing.slice(i, i + 50)).execute();
  }
}

// ponytail: no down — can't distinguish rows this migration added from a
// later catalog's; catalog deletions ship as their own migrations anyway.
export async function down(): Promise<void> { /* irreversible sync */ }
