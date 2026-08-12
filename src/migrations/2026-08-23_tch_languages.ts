import { type Kysely } from "kysely";
import { buildCatalog, idFor } from "../seed-data/catalog.js";
import { HYMNS_TCH_DE } from "../seed-data/hymns-tch-de.js";
import { HYMNS_TCH_FR } from "../seed-data/hymns-tch-fr.js";
import { HYMNS_TCH_PT } from "../seed-data/hymns-tch-pt.js";
import { HYMNS_TCH_RU } from "../seed-data/hymns-tch-ru.js";
import { HYMNS_TCH_ML } from "../seed-data/hymns-tch-ml.js";
import { HYMNS_TCH_SQ } from "../seed-data/hymns-tch-sq.js";
import { HYMNS_TCH_HU } from "../seed-data/hymns-tch-hu.js";
import { Environment } from "../helpers/Environment.js";

// Adds the Cyber Hymnal multi-language catalog: German, French, Portuguese,
// Russian, Malayalam, Albanian, Hungarian (see tools/import-tch-lang.ts).
// All songs columns exist by 2026-08-22, so rows insert whole.
const IDS = [...HYMNS_TCH_DE, ...HYMNS_TCH_FR, ...HYMNS_TCH_PT, ...HYMNS_TCH_RU, ...HYMNS_TCH_ML, ...HYMNS_TCH_SQ, ...HYMNS_TCH_HU]
  .map(s => idFor(s.t));

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
