import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

// The seed migration only inserts songs the core commons DB lacks. This one adds the
// file rows that later catalog builds introduced for songs already there: 30 s preview,
// instrumental bed, and granted-as-is extras (sources/extra/*).
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
    console.log(`asset_files_sync: ${added} file rows added`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
