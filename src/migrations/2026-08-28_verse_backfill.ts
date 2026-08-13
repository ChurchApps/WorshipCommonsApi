import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { VERSE_BACKFILL_IDS } from "../seed-data/frozen-ids.js";
import { Environment } from "../helpers/Environment.js";

// Pushes the expanded multi-verse chordPro (was tools/backfill-verses.ts) into catalog
// rows that were seeded with Verse 1 only. Touches only the frozen backfill id set.
export async function up(db: Kysely<any>): Promise<void> {
  const ids = new Set(VERSE_BACKFILL_IDS);
  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    if (!ids.has(row.id)) continue;
    await db.updateTable("songs").set({ chordPro: row.chordPro }).where("id", "=", row.id).execute();
  }
}

export async function down(): Promise<void> {
  // data-only migration; prior chordPro is re-derivable from the seed files
}
