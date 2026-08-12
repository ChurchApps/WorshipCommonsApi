import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";
import { buildCatalog } from "../src/seed-data/catalog.js";

// Looks up each catalog song on hymnary.org and records how many hymnals it
// appears in (totalInstances) — a century-scale popularity proxy used to rank
// songs until real usage data exists. Respects the site's 5s crawl-delay.
//   tsx tools/import-hymnary-popularity.ts [--dry]
// Emits src/seed-data/popularity-map.ts.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dry = process.argv.includes("--dry");
const UA = { "User-Agent": "WorshipCommons content harvest (jeremy@zongker.net)" };
const DELAY = 5000;

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’,¡!¿?()."]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const cacheDir = path.join(os.tmpdir(), "hymnary-cache");
fs.mkdirSync(cacheDir, { recursive: true });

let blocked = 0;
async function getText(url: string): Promise<string | null> {
  const cf = path.join(cacheDir, url.replace(/^https?:\/\//, "").replace(/[^a-z0-9.-]+/gi, "_"));
  if (fs.existsSync(cf)) return fs.readFileSync(cf, "utf8");
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(90000), headers: UA });
      if (resp.status === 404) return null;
      if (resp.ok) {
        const text = await resp.text();
        fs.writeFileSync(cf, text);
        await new Promise(r => setTimeout(r, DELAY));
        return text;
      }
      if (resp.status === 403 || resp.status === 429) { blocked++; await new Promise(r => setTimeout(r, attempt * 60000)); continue; }
      if (resp.status < 500) return null;
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, attempt * 10000));
  }
  return null;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (field || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
      if (c === "\r" && text[i + 1] === "\n") i++;
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// CSV columns: displayTitle,firstLine,textTitle,refrainFirstLine,slug,languages,authors,meter,sources,totalInstances
async function search(qu: string): Promise<string[][]> {
  const csv = await getText(`https://hymnary.org/search?qu=${encodeURIComponent(qu)}&export=csv`);
  // "readings" is a catch-all pseudo-authority whose 3000+ count isn't a real text's
  return csv ? parseCsv(csv).slice(1).filter(r => r.length >= 10 && r[4] !== "readings") : [];
}

// Prefix match either way — hymnary titles carry parenthetical first lines.
const hits = (cand: string, w: string) => !!w && !!cand && (w.length >= 8 ? (cand.startsWith(w) || w.startsWith(cand)) : cand === w);

// totalInstances is per text *authority*, so a retitled variant of some other
// famous hymn carries that hymn's huge count under our title. A first-line
// match identifies the actual text; trust title-only matches only as fallback.
function bestMatch(rows: string[][], wantTitle: string, wantFirst: string): number {
  let byLine = 0, byTitle = 0;
  for (const r of rows) {
    const n = parseInt(r[9], 10) || 0;
    if (hits(norm(r[1]), wantFirst)) byLine = Math.max(byLine, n);
    else if ([r[2], r[0], r[1]].some(c => hits(norm(c), wantTitle))) byTitle = Math.max(byTitle, n);
  }
  return byLine || byTitle;
}

const { rows: catRows } = buildCatalog("");
const out: Record<string, number> = {};
let found = 0;
for (const song of catRows) {
  const firstLine = (song.chordPro || "").split("\n")
    .map((l: string) => l.replace(/\[[^\]]*\]/g, "").trim())
    .find((l: string) => l && !/^(Verse|Chorus|Coro|Refrain|Bridge)/i.test(l)) || "";
  const wantTitle = norm(song.title), wantFirst = norm(firstLine);

  let count = bestMatch(await search(`in:texts textTitle:"${song.title}"`), wantTitle, wantFirst);
  if (!count && firstLine) count = bestMatch(await search(`in:texts textTitle:"${firstLine}"`), wantTitle, wantFirst);
  if (blocked >= 4) { console.error("Blocked by hymnary.org (repeated 403/429) — rerun later; cache resumes where this left off."); process.exit(1); }

  out[song.title] = count;
  if (count) found++;
  console.log(`  [${String(count).padStart(4)}] ${song.title}`);
}
console.log(`\nFound hymnal counts for ${found}/${catRows.length} songs`);
if (dry) process.exit(0);

const entries = Object.entries(out).sort((a, b) => b[1] - a[1])
  .map(([t, n]) => `  ${JSON.stringify(t)}: ${n}`);
fs.writeFileSync(path.join(__dirname, "..", "src", "seed-data", "popularity-map.ts"),
  `// Generated by tools/import-hymnary-popularity.ts — do not edit by hand.
// Number of hymnals each song appears in per hymnary.org (totalInstances).
// Popularity proxy until real usage data exists. 0 = not found there.
// Attribution: Hymnary.org — see .notes/content-sources.md.
export const HYMNAL_COUNT: Record<string, number> = {
${entries.join(",\n")}
};
`);
console.log("Wrote popularity-map.ts");
