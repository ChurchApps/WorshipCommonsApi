import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";

// Larry Holder harvest had copyright/credits as Verse 1. Content#24 cleaned
// lyrics.chordpro; this patches live commons (VPC-only) from the vendored catalog.
const STANZA = /^(?:verse|chorus|refrain|bridge|tag|intro|outro|ending|coda|pre-?chorus)\b/i;

function firstLine(chordPro: string): string | null {
  for (const raw of (chordPro || "").split(/\r?\n/)) {
    const line = raw.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
    if (!line || line.startsWith("{") || STANZA.test(line)) continue;
    return line.slice(0, 255);
  }
  return null;
}

export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const catalog = JSON.parse(readFileSync("config/catalog.json", "utf8"));
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    let n = 0;
    for (const row of catalog.rows as { id: string; license?: string; chordPro?: string }[]) {
      if (row.license !== "larry-holder") continue;
      const fl = firstLine(row.chordPro || "");
      const hasChords = /\[[A-G][#b]?/.test(row.chordPro || "") ? 1 : 0;
      const [r] = await pool.query(
        "update songs set chordPro = ?, firstLine = ?, hasChords = ? where assetId = ?",
        [row.chordPro, fl, hasChords, row.id]
      );
      n += (r as { affectedRows: number }).affectedRows;
    }
    console.log(`strip_lh_lyric_chrome: ${n} songs updated`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
