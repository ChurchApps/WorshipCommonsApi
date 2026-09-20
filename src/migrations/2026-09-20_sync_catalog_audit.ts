import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";

// Content catalog-full-audit: themes on untagged originals, scripture fills,
// ChordPro chrome strip, videoUrl, key/bpm/time from the vendored catalog.
// Prod commons is VPC-only; this patches live songs from config/catalog.json.
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
    for (const row of catalog.rows as {
      id: string; themes?: string | null; scripture?: string | null; scriptureText?: string | null;
      chordPro?: string; videoUrl?: string | null; songKey?: string | null; bpm?: number | null;
      timeSignature?: string | null;
    }[]) {
      const fl = firstLine(row.chordPro || "");
      const hasChords = /\[[A-G][#b]?/.test(row.chordPro || "") ? 1 : 0;
      const form = JSON.stringify(draftForm(row.chordPro || ""));
      const [r] = await pool.query(
        "update songs set themes = ?, scripture = ?, scriptureText = ?, chordPro = ?, firstLine = ?, hasChords = ?, form = ?, videoUrl = ?, songKey = ?, bpm = ?, timeSignature = ? where assetId = ?",
        [
          row.themes ?? null,
          row.scripture ?? null,
          row.scriptureText ?? null,
          row.chordPro ?? null,
          fl,
          hasChords,
          form,
          row.videoUrl ?? null,
          row.songKey ?? null,
          row.bpm ?? null,
          row.timeSignature ?? null,
          row.id
        ]
      );
      n += (r as { affectedRows: number }).affectedRows;
    }
    console.log(`sync_catalog_audit: ${n} songs updated`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
