import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Pushes the chord-backfilled chordPro (tools/backfill-chords.py) and retrimmed
// midiBytes into existing catalog rows. Insert-only for any new catalog songs.
export async function up(db: Kysely<any>): Promise<void> {
  const { rows } = buildCatalog(Environment.contentRoot);
  const existing = new Set((await db.selectFrom("songs").select("id").execute()).map((r: any) => r.id));
  for (const row of rows) {
    if (existing.has(row.id)) {
      await db.updateTable("songs")
        .set({ chordPro: row.chordPro, midiBytes: row.midiBytes })
        .where("id", "=", row.id).execute();
    } else {
      const { lyricsUrl: _lyricsUrl, ...ins } = row;
      await db.insertInto("songs").values(ins).execute();
    }
  }
}

export async function down(): Promise<void> {
  // data-only migration; prior chordPro is not retained
}
