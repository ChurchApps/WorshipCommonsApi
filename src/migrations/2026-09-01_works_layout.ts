import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Translation families now share tune.mid/tune.abc/art.webp via works/<slug>/ in
// the content repo: inherited asset urls moved to works/… paths, parent links are
// derived from work.json (three backwards families flipped so the original-language
// song is canonical). Re-points every catalog row's affected columns.
export async function up(db: Kysely<any>): Promise<void> {
  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    await db.updateTable("songs")
      .set({
        midiUrl: row.midiUrl,
        midiBytes: row.midiBytes,
        abcUrl: row.abcUrl,
        artUrl: row.artUrl,
        parentSongId: row.parentSongId,
        relationLabel: row.relationLabel
      })
      .where("id", "=", row.id).execute();
  }
}

// data backfill from catalog.json — prior values aren't recoverable
export async function down(): Promise<void> {}
