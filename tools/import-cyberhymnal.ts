import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";
import { buildCatalog } from "../src/seed-data/catalog.js";

// Salvages melody MIDIs from The Cyber Hymnal (hymntime.com/tch) via the Wayback
// Machine — the live site went dark sometime before 2026-08. Usage:
//   tsx tools/import-cyberhymnal.ts [--dry]
// Legal basis (tch/misc/copyrite.htm, archived): "Material on our site which does
// not have a copyright notice may be considered in the public domain. You may post
// our public domain MIDI files, scores, pictures, etc. on another Web site,
// provided you attribute them to the Cyber Hymnal & include a link." Pages whose
// visible text carries a copyright notice are skipped.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetDir = path.join(__dirname, "seed-assets", "midi");
const dry = process.argv.includes("--dry");
const WB = "http://web.archive.org/web/20130601000000id_/";
const SITE = "http://www.hymntime.com/tch/";

const norm = (s: string) => s.toLowerCase().replace(/['’,!()."]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const cacheDir = path.join(os.tmpdir(), "tch-cache");
fs.mkdirSync(cacheDir, { recursive: true });

async function get(url: string): Promise<Response | null> {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(90000) });
      if (resp.status === 404) return null;
      if (resp.ok) return resp;
      if (resp.status !== 429 && resp.status < 500) return null;
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, attempt * 5000));
  }
  return null;
}

async function getText(url: string): Promise<string | null> {
  const cf = path.join(cacheDir, url.replace(/^https?:\/\//, "").replace(/[^a-z0-9.-]+/gi, "_"));
  if (fs.existsSync(cf)) return fs.readFileSync(cf, "utf8");
  const resp = await get(url);
  if (!resp) return null;
  const text = await resp.text();
  fs.writeFileSync(cf, text);
  await new Promise(r => setTimeout(r, 250));
  return text;
}

// Pages listing several tunes: pick the tune our chord chart was written for
// (catalog composer credit / chorus structure), not the first link on the page.
const TUNE_OVERRIDE: Record<string, string> = {
  "At the Cross": "hudson.mid",
  "God of Our Fathers": "national_hymn.mid",
  "Now the Day Is Over": "merrial.mid",
  "Ride On, Ride On in Majesty": "st_drostane.mid"
};

// Same hymn under a different TCH title — verified by hand against the hymn page.
const ALIASES: Record<string, string> = {};
try {
  Object.assign(ALIASES, JSON.parse(fs.readFileSync(path.join(__dirname, "cyberhymnal-aliases.json"), "utf8")));
} catch { /* no aliases yet */ }

const index = new Map<string, string>();
for (const letter of "abcdefghijklmnopqrstuvwxyz") {
  const raw = await getText(`${WB}${SITE}ttl/ttl-${letter}.htm`);
  if (!raw) { console.error(`missing index ttl-${letter}.htm`); continue; }
  const html = raw.replace(/­/g, "");
  for (const m of html.matchAll(/href="\.\.\/(htm\/[^"]+\.htm)"[^>]*>([^<]+)</gi)) {
    let title = m[2].replace(/\s+/g, " ").trim();
    const inv = title.match(/^(.+), (The|A|An)$/);
    if (inv) title = `${inv[2]} ${inv[1]}`;
    const k = norm(title);
    if (k && !index.has(k)) index.set(k, m[1]);
  }
}
console.log(`Cyber Hymnal index: ${index.size} titles`);

const { rows } = buildCatalog("");
const candidates = rows.filter((r: any) => !r.midiUrl && r.license === "PD");
const hits: [string, string][] = [];
const misses: string[] = [];
for (const r of candidates) {
  const n = norm(r.title);
  const page = index.get(n) || index.get(ALIASES[n] ?? "") || index.get(n.replace(/^o /, "oh ")) || index.get(n.replace(/^oh /, "o "))
    || index.get(n.replace(/\bye\b/, "you")) || index.get(n.replace(/\byou\b/, "ye"));
  if (page) hits.push([r.title, page]); else misses.push(r.title);
}
console.log(`Matched ${hits.length} of ${candidates.length} catalog songs still lacking a MIDI`);

if (misses.length) {
  console.log(`\nUnmatched (nearest index title — add true matches to cyberhymnal-aliases.json):`);
  const words = (s: string) => new Set(s.split(" "));
  for (const t of misses) {
    const nw = words(norm(t));
    let best = "", bestScore = 0;
    for (const [k] of index) {
      const kw = words(k);
      let common = 0;
      for (const w of nw) if (kw.has(w)) common++;
      const score = common / Math.max(nw.size, kw.size);
      if (score > bestScore) { bestScore = score; best = k; }
    }
    console.log(`  ${t}  ->  ${bestScore >= 0.5 ? `${best} (${bestScore.toFixed(2)})` : "-"}`);
  }
}
if (dry) process.exit(0);

fs.mkdirSync(assetDir, { recursive: true });
// Once catalog.ts merges this map, previously imported songs stop being candidates —
// carry the existing entries forward (bytes refreshed from disk, e.g. after tail trims).
const map: Record<string, { file: string; bytes: number }> = {};
try {
  const { MIDI_MAP_TCH } = await import("../src/seed-data/midi-map-tch.js");
  for (const [t, m] of Object.entries(MIDI_MAP_TCH) as [string, { file: string; bytes: number }][]) {
    const p = path.join(assetDir, m.file);
    if (fs.existsSync(p)) map[t] = { file: m.file, bytes: fs.statSync(p).size };
  }
} catch { /* first run */ }
for (const [title, page] of hits) {
  const raw = await getText(`${WB}${SITE}${page}`);
  if (!raw) { console.error(`  skip ${title}: page not archived`); continue; }
  const html = raw.replace(/­/g, "");
  const text = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ");
  // A dated notice or arrangement claim means the page holds non-PD material (TCH's
  // dedication covers only un-noticed pages). Bare © photo credits and prose
  // mentions of the word "copyright" don't count.
  if (/(©|&copy;)\s*(19|20)\d\d|copyright\s+(19|20)\d\d|arrangement\s*(©|&copy;)/i.test(text)) {
    console.error(`  skip ${title}: page carries a copyright notice`); continue;
  }
  const mids = [...html.matchAll(/href="((?:\.\.\/)+mid\/[^"]+\.mid)"/gi)].map(m => m[1]);
  const want = TUNE_OVERRIDE[title];
  const chosen = want ? mids.find(m => m.endsWith(`/${want}`)) : mids[0];
  if (!chosen) { console.error(`  skip ${title}: no MIDI link${want ? ` for tune ${want}` : ""}`); continue; }
  const midUrl = `${SITE}${chosen.replace(/^(\.\.\/)+/, "")}`;
  const file = `tch-${path.basename(chosen)}`;
  const target = path.join(assetDir, file);
  if (!fs.existsSync(target)) {
    const midResp = await get(`${WB}${midUrl}`);
    if (!midResp) { console.error(`  skip ${title}: MIDI not archived (${midUrl})`); continue; }
    const buf = Buffer.from(await midResp.arrayBuffer());
    if (buf.subarray(0, 4).toString("latin1") !== "MThd") { console.error(`  skip ${title}: not a MIDI file`); continue; }
    fs.writeFileSync(target, buf);
    await new Promise(r => setTimeout(r, 250));
  }
  map[title] = { file, bytes: fs.statSync(target).size };
  console.log(`  ${file} <- ${title}`);
}

const lines = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  .map(([t, m]) => `  ${JSON.stringify(t)}: { file: ${JSON.stringify(m.file)}, bytes: ${m.bytes} }`);
fs.writeFileSync(path.join(__dirname, "..", "src", "seed-data", "midi-map-tch.ts"),
  `// Generated by tools/import-cyberhymnal.ts — do not edit by hand.
// Melody MIDI files from The Cyber Hymnal (hymntime.com/tch, salvaged via the
// Wayback Machine). Its copyright page dedicates un-noticed material to the
// public domain and grants reposting with attribution; pages with copyright
// notices are excluded at import time. Attribution: The Cyber Hymnal,
// http://www.hymntime.com/tch/ — see .notes/content-sources.md.
export const MIDI_MAP_TCH: Record<string, { file: string; bytes: number }> = {
${lines.join(",\n")}
};
`);
console.log(`Wrote midi-map-tch.ts (${lines.length} songs)`);
const { execSync } = await import("child_process");
execSync("npx eslint --fix src/seed-data/midi-map-tch.ts", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
