import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

// The content repo dropped its works/<slug>/ layer (2026-09-16): a translation family's shared
// tune, cover and audio now live in the parent song's package and translations inherit them.
// Every catalog url that pointed at works/… now points at songs/…. Drop the works/ file rows
// and add the rows the current catalog names that the core commons DB lacks.
const FILE_COLS = [
  "artUrl", "midiUrl", "lyricsUrl", "abcUrl", "demoAudioUrl", "sheetPdfUrl", "stemsZipUrl", "previewUrl", "instrumentalUrl", "compositionZipUrl", "audioZipUrl"
];
const sid = () => randomBytes(8).toString("base64url").slice(0, 11);

export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const catalog = JSON.parse(readFileSync("config/catalog.json", "utf8"));
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    const [gone] = await pool.query("delete from assetFiles where name like 'works/%'");
    const [rows] = await pool.query("select assetId, name from assetFiles");
    const have = new Set((rows as { assetId: string; name: string }[]).map(r => `${r.assetId}\n${r.name}`));
    const [assets] = await pool.query("select id from assets where assetType = 'song'");
    const songs = new Set((assets as { id: string }[]).map(a => a.id));
    let added = 0;
    for (const row of catalog.rows as any[]) {
      if (!songs.has(row.id)) continue;
      for (const f of [...FILE_COLS.map(c => row[c]), ...(row.extraUrls || [])]) {
        const name = typeof f === "string" ? f.replace(/\\/g, "/") : "";
        if (!name || name.length > 100 || have.has(`${row.id}\n${name}`)) continue; // assetFiles.name is varchar(100)
        await pool.query("insert into assetFiles (id, assetId, name, action) values (?, ?, ?, 'add')", [sid(), row.id, name]);
        have.add(`${row.id}\n${name}`);
        added++;
      }
    }
    console.log(`unwork_asset_files: ${(gone as any).affectedRows} works/ rows removed, ${added} file rows added`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
