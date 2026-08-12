import { type Kysely } from "kysely";
import { buildCatalog, idFor } from "../seed-data/catalog.js";
import { HYMNS_MODERN } from "../seed-data/hymns-modern.js";
import { Environment } from "../helpers/Environment.js";

// Adds the 20th-century public-domain catalog (spirituals, global folk hymnody,
// anonymous choruses). None have seed assets, so no content files to copy.
const IDS = HYMNS_MODERN.map(s => idFor(s.t));

export async function up(db: Kysely<any>): Promise<void> {
  const existing = await db.selectFrom("songs").select("id").where("id", "in", IDS).execute();
  const have = new Set(existing.map((r: any) => r.id));
  // hymnalCount arrives in 2026-08-22_hymnal_popularity — strip it so this runs first
  const rows = buildCatalog(Environment.contentRoot).rows
    .filter(r => IDS.includes(r.id) && !have.has(r.id))
    .map(({ hymnalCount, ...r }) => r);
  if (rows.length) await db.insertInto("songs").values(rows).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom("songs").where("id", "in", IDS).execute();
}
