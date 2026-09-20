import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";

// Content#25 expanded verse-1 seed charts from matching Open Hymnal ABC.
// Prod commons is VPC-only; patch chordPro/form from the vendored catalog.
const IDS = new Set([
  "DJiXNvQVFPH", // Away in a Manger
  "MHG5BeaFhHD", // For All the Saints
  "_UFqNA48X8n", // It Is Well with My Soul
  "O56iN1F_4rL", // Now Thank We All Our God
  "Uo8aHwRz1ez", // Savior, Like a Shepherd Lead Us
  "cUjsmeNrUiG", // The Lord's My Shepherd
  "U0YapCDGNs9", // Were You There
  "RfqBjrobd62"  // What Child Is This
]);
const STANZA = /^(?:verse|chorus|refrain|bridge|tag|intro|outro|ending|coda|pre-?chorus)\b/i;

function firstLine(chordPro: string): string | null {
  for (const raw of (chordPro || "").split(/\r?\n/)) {
    const line = raw.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
    if (!line || line.startsWith("{") || STANZA.test(line)) continue;
    return line.slice(0, 255);
  }
  return null;
}

function draftForm(chordPro: string) {
  const labels: string[] = [];
  for (const raw of (chordPro || "").split(/\r?\n/)) {
    const t = raw.replace(/\[[^\]]*\]/g, "").trim();
    if (t && STANZA.test(t) && !/\[[^\]]+\]/.test(raw)) labels.push(t);
  }
  if (!labels.length) return null;
  const seen = new Map<string, number>();
  const sections: { label: string; lyric: number }[] = [];
  let lyric = 0;
  for (const label of labels) {
    if (!seen.has(label)) {
      seen.set(label, ++lyric);
      sections.push({ label, lyric });
    }
  }
  return { status: "draft", sections, defaultOrder: labels };
}

export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const catalog = JSON.parse(readFileSync("config/catalog.json", "utf8"));
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    let n = 0;
    for (const row of catalog.rows as { id: string; chordPro?: string }[]) {
      if (!IDS.has(row.id) || !row.chordPro) continue;
      const fl = firstLine(row.chordPro);
      const hasChords = /\[[A-G][#b]?/.test(row.chordPro) ? 1 : 0;
      const form = JSON.stringify(draftForm(row.chordPro));
      const [r] = await pool.query(
        "update songs set chordPro = ?, firstLine = ?, hasChords = ?, form = ? where assetId = ?",
        [row.chordPro, fl, hasChords, form, row.id]
      );
      n += (r as { affectedRows: number }).affectedRows;
    }
    console.log(`expand_abc_verses: ${n} songs updated`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
