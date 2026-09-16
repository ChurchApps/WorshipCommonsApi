import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

// The public site reads api.churchapps.org/commons (the core commons DB), not this
// service's own songs table. Insert any catalog songs missing from that DB so
// Custom writer grants (Larry Holder, etc.) show up in the library filter.
const FILE_COLS = ["artUrl", "midiUrl", "lyricsUrl", "abcUrl", "demoAudioUrl", "sheetPdfUrl", "stemsZipUrl", "previewUrl", "instrumentalUrl"];
const SONG_COLS = [
  "year",
  "songKey",
  "bpm",
  "timeSignature",
  "meter",
  "scripture",
  "scriptureText",
  "hymnalCount",
  "chordPro",
  "videoUrl",
  "parentSongId",
  "relationLabel",
  "licenseVersion",
  "licenseUrl",
  "proAnswer",
  "certified",
  "confidence"
];

const sid = () => randomBytes(8).toString("base64url").slice(0, 11);

export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;

  const catalog = JSON.parse(readFileSync("config/catalog.json", "utf8"));
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    await pool.query("alter table assets modify column license varchar(32) null");
    const [haveRows] = await pool.query("select id from assets");
    const have = new Set((haveRows as { id: string }[]).map(r => r.id));
    const [authorRows] = await pool.query("select id, name from authors");
    const authorByName = new Map((authorRows as { id: string; name: string }[]).map(a => [a.name, a.id]));

    for (const row of catalog.rows as any[]) {
      if (have.has(row.id)) continue;
      let authorId: string | null = null;
      if (row.writer) {
        authorId = authorByName.get(row.writer) || null;
        if (!authorId) {
          authorId = sid();
          await pool.query("insert into authors (id, name) values (?, ?)", [authorId, row.writer]);
          authorByName.set(row.writer, authorId);
        }
      }
      const subId = sid();
      const now = new Date();
      await pool.query(
        `insert into assets (id, assetType, name, tags, language, license, status, publishedAt, publishedSubmissionId, downloadCount, ratingCount, ratingSum, featured)
         values (?, 'song', ?, ?, ?, ?, 'published', ?, ?, 0, 0, 0, 0)`,
        [row.id, row.title, row.themes || null, row.language || null, row.license || null, now, subId]
      );
      const song: Record<string, unknown> = { assetId: row.id, authorId };
      for (const c of SONG_COLS) if (row[c] !== undefined) song[c] = row[c];
      song.certified = row.certified === false ? 0 : 1;
      const cols = Object.keys(song);
      await pool.query(
        `insert into songs (${cols.join(",")}) values (${cols.map(() => "?").join(",")})`,
        cols.map(c => song[c])
      );
      const detail: Record<string, unknown> = { writer: row.writer, certified: true };
      await pool.query(
        `insert into submissions (id, assetId, submittedBy, status, payload, note, submittedAt, reviewedAt)
         values (?, ?, 'seed', 'approved', ?, 'Imported', ?, ?)`,
        [subId, row.id, JSON.stringify({ name: row.title, tags: row.themes, language: row.language, license: row.license, detail }), now, now]
      );
      const seen = new Set<string>();
      for (const f of [...FILE_COLS.map(c => row[c]), ...(row.extraUrls || [])]) {
        const name = typeof f === "string" ? f.replace(/\\/g, "/") : "";
        if (!name || name.length > 100) continue;
        const base = name.split("/").pop() || "";
        if (seen.has(base)) continue;
        seen.add(base);
        await pool.query(
          "insert into assetFiles (id, assetId, name, action) values (?, ?, ?, 'add')",
          [sid(), row.id, name]
        );
      }
    }
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
