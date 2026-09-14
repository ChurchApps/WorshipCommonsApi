import { type Kysely, sql } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Custom writer grants (e.g. larry-holder) are longer than PD/WC. Widen license
// before inserting. Then insert any catalog id missing from songs — Holder solos
// and Elton Smith co-writes under the Larry Holder Music grant.
const SONG_COLS = [
  "id", "title", "writer", "year", "themes", "songKey", "bpm", "timeSignature",
  "language", "scripture", "scriptureText", "license", "churchCount", "hymnalCount",
  "chordPro", "demoAudioUrl", "demoAudioBytes", "sheetPdfUrl", "sheetPdfBytes",
  "stemsZipUrl", "stemsZipBytes", "midiUrl", "midiBytes", "lyricsUrl", "abcUrl",
  "videoUrl", "writerPortraitUrl", "writerBio", "artUrl", "parentSongId",
  "relationLabel", "status", "submittedBy", "proAnswer", "certified"
] as const;

function songRow(r: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of SONG_COLS) if (k in r) out[k] = r[k];
  if (out.status == null) out.status = "approved";
  if (out.certified == null) out.certified = true;
  if (out.churchCount == null) out.churchCount = 0;
  if (out.hymnalCount == null) out.hymnalCount = 0;
  return out;
}

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE songs MODIFY COLUMN license varchar(32)`.execute(db);

  const { rows } = buildCatalog(Environment.contentRoot);
  const existing = await db.selectFrom("songs").select("id").where("id", "in", rows.map(r => r.id)).execute();
  const have = new Set(existing.map((r: { id: string }) => r.id));
  const missing = rows.filter(r => !have.has(r.id)).map(songRow);
  for (let i = 0; i < missing.length; i += 50) {
    await db.insertInto("songs").values(missing.slice(i, i + 50)).execute();
  }
}

export async function down(): Promise<void> { /* license width and inserts stay */ }
