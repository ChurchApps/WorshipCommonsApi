import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";

// Live commons songs that have no chords yet take the catalog's chorded ChordPro and its key
// (writer chord charts harvested 2026-09-16; MIDI-derived chords for the rest).
export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const catalog = JSON.parse(readFileSync("config/catalog.json", "utf8"));
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    let n = 0;
    for (const row of catalog.rows as any[]) {
      if (!/\[[A-G][#b]?[^\]]*\]/.test(row.chordPro || "")) continue;
      const [r] = await pool.query(
        "update songs set chordPro = ?, songKey = ?, hasChords = 1 where assetId = ? and (hasChords = 0 or hasChords is null)",
        [row.chordPro, row.songKey, row.id]
      );
      n += (r as { affectedRows: number }).affectedRows;
    }
    console.log(`sync_chords: ${n} songs updated`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
