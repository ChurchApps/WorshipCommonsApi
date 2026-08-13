import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

// The catalog master lives in the WorshipCommonsContent repo; config/catalog.json
// is a vendored copy of its generated catalog.json (refresh with `yarn sync-catalog`).
// It ships to the migrate Lambda via the serverless config/** package pattern.

// deterministic char(11) id in UniqueIdHelper.shortId's base64url format — stable across reseeds
export const idFor = (title: string) => crypto.createHash("sha1").update("wcsong:" + title).digest("base64url").slice(0, 11);

export interface CatalogFile { songId: string; src: string; key: string; }

// url columns stored in catalog.json as bucket keys, prefixed with the stage's contentRoot here
const URL_COLS = ["midiUrl", "lyricsUrl", "abcUrl", "artUrl", "writerPortraitUrl"];

export function buildCatalog(contentRoot: string) {
  // cwd-relative like EnvironmentBase's config loading — works under tsx and in the Lambda task root
  const raw = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "config", "catalog.json"), "utf8"));
  const rows = raw.rows.map((r: any) => {
    const row = { ...r };
    for (const c of URL_COLS) if (row[c]) row[c] = `${contentRoot}/${row[c]}`;
    return row;
  });
  return { rows: rows as any[], files: raw.files as CatalogFile[] };
}
