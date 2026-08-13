import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { TCH_LANGUAGE_IDS as IDS } from "../seed-data/frozen-ids.js";
import { Environment } from "../helpers/Environment.js";

// Adds the Cyber Hymnal multi-language catalog: German, French, Portuguese,
// Russian, Malayalam, Albanian, Hungarian (see the content library's harvest tools).
// All songs columns exist by 2026-08-22, so rows insert whole.

export async function up(db: Kysely<any>): Promise<void> {
  const existing = await db.selectFrom("songs").select("id").where("id", "in", IDS).execute();
  const have = new Set(existing.map((r: any) => r.id));
  const ids = new Set(IDS);
  const rows = buildCatalog(Environment.contentRoot).rows.filter(r => ids.has(r.id) && !have.has(r.id));
  for (let i = 0; i < rows.length; i += 50) {
    await db.insertInto("songs").values(rows.slice(i, i + 50)).execute();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom("songs").where("id", "in", IDS).execute();
}
