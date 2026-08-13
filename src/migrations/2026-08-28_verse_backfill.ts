import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { VERSE_EXPANSION } from "../seed-data/verse-expansion.js";
import { Environment } from "../helpers/Environment.js";

// Pushes the expanded multi-verse chordPro (tools/backfill-verses.ts) into catalog
// rows that were seeded with Verse 1 only. Touches only songs in verse-expansion.ts.
export async function up(db: Kysely<any>): Promise<void> {
  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    if (!VERSE_EXPANSION[row.title]) continue;
    await db.updateTable("songs").set({ chordPro: row.chordPro }).where("id", "=", row.id).execute();
  }
}

export async function down(): Promise<void> {
  // data-only migration; prior chordPro is re-derivable from the seed files
}
