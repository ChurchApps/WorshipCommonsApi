import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

// The catalog master lives in the WorshipCommonsContent repo; config/catalog.json
// is a vendored copy of its generated catalog.json (refresh with `yarn sync-catalog`).
// It ships to the migrate Lambda via the serverless config/** package pattern.
// The content bucket mirrors the repo layout, so url columns are repo-relative
// paths (songs/<lang>/<section>/<slug>/...) prefixed with the stage's contentRoot.

// deterministic char(11) id in UniqueIdHelper.shortId's base64url format — stable across reseeds
export const idFor = (title: string) => crypto.createHash("sha1").update("wcsong:" + title).digest("base64url").slice(0, 11);

const URL_COLS = [
  "midiUrl", "lyricsUrl", "abcUrl", "artUrl", "writerPortraitUrl", "demoAudioUrl", "sheetPdfUrl", "stemsZipUrl"
];

/** Columns that exist on songs. Catalog.json may carry extra keys (meter, confidence, licenseUrl). */
export const SONG_INSERT_COLS = [
  "id", "title", "writer", "year", "themes", "songKey", "bpm", "timeSignature",
  "language", "scripture", "scriptureText", "license", "churchCount", "hymnalCount",
  "chordPro", "demoAudioUrl", "demoAudioBytes", "sheetPdfUrl", "sheetPdfBytes",
  "stemsZipUrl", "stemsZipBytes", "midiUrl", "midiBytes", "lyricsUrl", "abcUrl",
  "videoUrl", "writerPortraitUrl", "writerBio", "artUrl", "parentSongId",
  "relationLabel", "status", "submittedBy", "proAnswer", "certified"
] as const;

export function songInsert(r: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of SONG_INSERT_COLS) if (k in r) out[k] = r[k];
  if (out.status == null) out.status = "approved";
  if (out.certified == null) out.certified = true;
  if (out.churchCount == null) out.churchCount = 0;
  if (out.hymnalCount == null) out.hymnalCount = 0;
  return out;
}

export function buildCatalog(contentRoot: string) {
  // cwd-relative like EnvironmentBase's config loading — works under tsx and in the Lambda task root
  const raw = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "config", "catalog.json"), "utf8"));
  const rows = raw.rows.map((r: any) => {
    const row = { ...r };
    for (const c of URL_COLS) if (row[c]) row[c] = `${contentRoot}/${row[c]}`;
    return row;
  });
  return { rows: rows as any[] };
}
