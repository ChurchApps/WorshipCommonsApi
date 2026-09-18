import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

// Live commons: assetFiles.name was varchar(100) until 2026-09-08. Silent truncation left
// fileUrls keys like attributi / duration. / sl. Complete those prefixes, then re-key and
// insert catalog files (including extraUrls) without the old 100-char skip.
const FILE_COLS = [
  "artUrl", "midiUrl", "lyricsUrl", "abcUrl", "demoAudioUrl", "sheetPdfUrl", "stemsZipUrl", "previewUrl", "instrumentalUrl", "compositionZipUrl", "audioZipUrl"
];
const FILES_BY_FOLDER: Record<string, string[]> = {
  derivatives: ["chart.chordpro", "slides.json", "attribution.txt", "duration.json", "cover-thumb.webp", "sources.txt", "timing.json", "score.musicxml", "chart.pdf"],
  masters: ["song.json", "cover.webp", "score.musicxml", "lyrics.chordpro"],
  sources: ["tune.mid", "tune.abc", "timing.json", "cover.webp", "sheetPdf.pdf", "score.musicxml"],
  output: ["composition.zip", "audio.zip"]
};
const COMPLETE_EXT = /\.(mp3|wav|m4a|ogg|flac|zip|pdf|mid|midi|abc|webp|jpg|jpeg|png|json|txt|cho|chordpro|musicxml|xml|mxl)$/i;
const KNOWN = new Set(Object.values(FILES_BY_FOLDER).flat());
const sid = () => randomBytes(8).toString("base64url").slice(0, 11);
const base = (name: string) => name.split("/").pop() || "";

function completedPackageName(name: string): string {
  const n = name.replace(/\\/g, "/");
  if (!n) return n;
  const b = base(n);
  if (!b) return n;
  if (KNOWN.has(b) || COMPLETE_EXT.test(b)) return n;
  const i = n.lastIndexOf("/");
  if (i < 0) return Object.values(FILES_BY_FOLDER).flat().find((f) => f.startsWith(b)) || n;
  const folder = n.slice(n.lastIndexOf("/", i - 1) + 1, i);
  const hit = (FILES_BY_FOLDER[folder] || []).find((f) => f.startsWith(b));
  return hit ? `${n.slice(0, i)}/${hit}` : n;
}

export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const catalog = JSON.parse(readFileSync("config/catalog.json", "utf8"));
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    const [rows] = await pool.query("select id, assetId, name, submissionId from assetFiles");
    const files = rows as { id: string; assetId: string; name: string; submissionId: string | null }[];
    const have = new Set(files.map((r) => `${r.assetId}\n${r.submissionId ?? ""}\n${r.name}`));
    let repaired = 0, dropped = 0;
    for (const r of files) {
      const to = completedPackageName(String(r.name || ""));
      if (!to || to === r.name) continue;
      const key = `${r.assetId}\n${r.submissionId ?? ""}\n${to}`;
      if (have.has(key)) {
        await pool.query("delete from assetFiles where id = ?", [r.id]);
        dropped++;
        continue;
      }
      await pool.query("update assetFiles set name = ? where id = ?", [to, r.id]);
      have.delete(`${r.assetId}\n${r.submissionId ?? ""}\n${r.name}`);
      have.add(key);
      r.name = to;
      repaired++;
    }

    const live = files.filter((f) => f.submissionId == null);
    const byCompleted = new Map(live.map((f) => [`${f.assetId}/${base(completedPackageName(f.name))}`, f]));
    const claimed = new Set<string>();
    let added = 0, rekeyed = 0;
    for (const row of catalog.rows as any[]) {
      for (const f of [...FILE_COLS.map((c) => row[c]), ...(row.extraUrls || [])]) {
        const name = typeof f === "string" ? f.replace(/\\/g, "/") : "";
        if (!name || name.length > 255) continue;
        const key = `${row.id}/${base(name)}`;
        const current = byCompleted.get(key);
        if (current && claimed.has(current.id)) continue;
        if (!current) {
          await pool.query("insert into assetFiles (id, assetId, name, action) values (?, ?, ?, 'add')", [sid(), row.id, name]);
          byCompleted.set(key, { id: "new", assetId: row.id, name, submissionId: null });
          added++;
          continue;
        }
        claimed.add(current.id);
        if (current.name !== name && current.id !== "new") {
          await pool.query("update assetFiles set name = ? where id = ?", [name, current.id]);
          rekeyed++;
        }
      }
    }
    console.log("repair_truncated_file_names", { repaired, dropped, added, rekeyed });
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
