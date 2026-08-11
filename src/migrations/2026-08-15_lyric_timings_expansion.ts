import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Syncs lyricsUrl for the expanded karaoke set (curated hymns via ABC-native
// timings — see tools/generate-lyric-timings.py). Update-only, idempotent.
export async function up(db: Kysely<any>): Promise<void> {
  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    await db.updateTable("songs").set({ lyricsUrl: row.lyricsUrl }).where("id", "=", row.id).execute();
  }
}

export async function down(): Promise<void> {
  // data-only migration; prior lyricsUrl values are re-derivable from the catalog
}
