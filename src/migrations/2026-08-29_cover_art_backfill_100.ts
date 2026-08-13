import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Backfills artUrl for the third batch of cover art (120 songs total, see
// src/seed-data/art-map.ts). Only sets songs the map matched — existing values are never cleared.
export async function up(db: Kysely<any>): Promise<void> {
  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    if (!row.artUrl) continue;
    await db.updateTable("songs").set({ artUrl: row.artUrl }).where("id", "=", row.id).execute();
  }
}

// data backfill — prior values aren't recoverable
export async function down(): Promise<void> {}
