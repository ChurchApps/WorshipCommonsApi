import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Backfills videoUrl from the regenerated seed video map (tools/import-videos.ts
// run against the full 562-song catalog). Only sets songs the map matched —
// existing links are never cleared.
export async function up(db: Kysely<any>): Promise<void> {
  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    if (!row.videoUrl) continue;
    await db.updateTable("songs").set({ videoUrl: row.videoUrl }).where("id", "=", row.id).execute();
  }
}

// data backfill — prior values aren't recoverable
export async function down(): Promise<void> {}
