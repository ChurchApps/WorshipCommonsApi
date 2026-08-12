import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";
import { buildCatalog } from "../src/seed-data/catalog.js";

// Harvests public-domain Spanish hymn texts from hymnary.org, most-published
// first (totalInstances). Only texts hymnary explicitly marks
// "Copyright: Public Domain" are kept. Respects the site's 5s crawl-delay.
//   tsx tools/import-hymnary-spanish.ts [--dry] [--max N]
// Emits src/seed-data/hymns-es-hymnary.ts.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dry = process.argv.includes("--dry");
const maxArg = process.argv.indexOf("--max");
const MAX = maxArg >= 0 ? parseInt(process.argv[maxArg + 1], 10) : 150;
const UA = { "User-Agent": "WorshipCommons content harvest (jeremy@zongker.net)" };
const DELAY = 5000;

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’,¡!¿?()."]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const cacheDir = path.join(os.tmpdir(), "hymnary-cache");
fs.mkdirSync(cacheDir, { recursive: true });

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
// Consecutive 403/429s mean the site has cut us off — abort rather than burn the list.
let blocked = 0;

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

const stripTags = (s: string) => s.replace(/<[^>]+>/g, "").replace(/­/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&#8217;|&rsquo;/g, "’").replace(/\s+/g, " ").trim();

const BOOK_ES: Record<string, string> = {
  Genesis: "Génesis", Exodus: "Éxodo", Deuteronomy: "Deuteronomio", Joshua: "Josué", Psalm: "Salmos", Psalms: "Salmos",
  Proverbs: "Proverbios", Isaiah: "Isaías", Jeremiah: "Jeremías", Ezekiel: "Ezequiel", Daniel: "Daniel",
  Matthew: "Mateo", Mark: "Marcos", Luke: "Lucas", John: "Juan", Acts: "Hechos", Romans: "Romanos",
  Galatians: "Gálatas", Ephesians: "Efesios", Philippians: "Filipenses", Colossians: "Colosenses",
  Hebrews: "Hebreos", James: "Santiago", Revelation: "Apocalipsis", Song: "Cantares"
};
const esRef = (ref: string) => {
  const m = ref.match(/^(\d?\s*)([A-Za-z]+)(.*)$/);
  if (!m) return ref;
  const book = BOOK_ES[m[2]];
  return book ? `${m[1]}${book}${m[3]}`.trim() : ref;
};

// --- Collect the full Spanish text list from the search CSV ---
interface CsvRow { title: string; firstLine: string; slug: string; authors: string; instances: number; }
const list: CsvRow[] = [];
for (let page = 1; page < 60; page++) {
  const url = `https://hymnary.org/search?qu=in%3Atexts+languages%3Aspanish&export=csv${page > 1 ? `&page=${page}` : ""}`;
  const csv = await getText(url);
  if (!csv) break;
  const rows = parseCsv(csv).slice(1).filter(r => r.length >= 10);
  for (const r of rows) list.push({ title: r[0], firstLine: r[1], slug: r[4], authors: r[6], instances: parseInt(r[9], 10) || 0 });
  if (rows.length < 50) break;
}
list.sort((a, b) => b.instances - a.instances);
console.log(`Spanish texts on hymnary: ${list.length}`);

// --- Existing catalog for dedupe + parent tune matching ---
const { rows: catRows } = buildCatalog("");
// Exclude this tool's own previous output from dedupe so reruns regenerate cleanly.
const own = new Set<string>();
try {
  const { HYMNS_ES_HYMNARY } = await import("../src/seed-data/hymns-es-hymnary.js");
  for (const s of HYMNS_ES_HYMNARY as any[]) own.add(norm(s.t));
} catch { /* first run */ }
const existing = new Set<string>();
for (const r of catRows.filter((x: any) => x.language === "Spanish" && !own.has(norm(x.title)))) {
  existing.add(norm(r.title));
  const first = (r.chordPro || "").split("\n").find((l: string) => l.trim() && !/^(Verse|Chorus|Coro)/i.test(l.trim()));
  if (first) existing.add(norm(first.replace(/\[[^\]]*\]/g, "")));
}
const englishByNorm = new Map<string, any>();
for (const r of catRows.filter((x: any) => x.language === "English")) englishByNorm.set(norm(r.title), r);

// Tune-slug heuristic: many gospel tunes are named for the English first line, so a
// catalog title that prefixes the tune slug identifies the original. Conservative:
// requires a 10+ char normalized match.
function findParentByTune(html: string): any | null {
  const tune = html.match(/href="\/tune\/([a-z0-9_]+)"/i)?.[1];
  if (!tune) return null;
  const tuneWords = tune.replace(/_/g, " ");
  for (const [n, row] of englishByNorm) {
    if (n.length >= 10 && (tuneWords.startsWith(n) || n.startsWith(tuneWords))) return row;
  }
  return null;
}

interface EsSong {
  t: string; a: string; y: number | null; th: string | null; k: string | null; bpm: number | null;
  ts: string | null; scr: string | null; chordPro: string; parent: string | null; rel: string | null; src: string | null;
}

const out: EsSong[] = [];
let checked = 0, rejected = 0;
for (const item of list) {
  if (out.length >= MAX) break;
  if (!item.slug) continue;
  if (existing.has(norm(item.title)) || existing.has(norm(item.firstLine))) continue;
  checked++;
  const before = blocked;
  const html = await getText(`https://hymnary.org/text/${item.slug}`);
  if (blocked > before && blocked >= 4) { console.error("Blocked by hymnary.org (repeated 403/429) — rerun later; cache resumes where this left off."); break; }
  if (!html) { rejected++; continue; }

  const infoTable = html.match(/<table class="infoTable"[\s\S]*?<\/table>/i)?.[0] || "";
  const info: Record<string, string> = {};
  for (const m of infoTable.matchAll(/hy_infoLabel">([^<]+):<\/span><\/td>\s*<td>([\s\S]*?)<\/td>/gi)) info[m[1].trim()] = stripTags(m[2]);
  if (info["Copyright"] !== "Public Domain") { rejected++; continue; }
  // Exactly Spanish — bilingual authorities (languages "English; Spanish") display
  // the English text, so a substring match would import English lyrics as Spanish.
  if ((info["Language"] || "").trim() !== "Spanish") { rejected++; continue; }

  const block = html.match(/authority_columns">([\s\S]*?)<\/div>/i)?.[1];
  if (!block) { rejected++; continue; }
  const srcHymnal = stripTags(block.match(/Source:\s*<a[^>]*>([\s\S]*?)<\/a>/i)?.[1] || "") || null;
  const clean = block.replace(/Source:[\s\S]*$/i, "");
  const verses: string[] = [];
  let chorus: string | null = null;
  for (const pm of clean.matchAll(/<p>([\s\S]*?)<\/p>/gi)) {
    let lines = pm[1].replace(/<br\s*\/?>/gi, "\n").split("\n").map(l => stripTags(l)).filter(Boolean);
    if (!lines.length) continue;
    let isChorus = false;
    if (/^(estribillo|coro|refrain|chorus)[:.]?$/i.test(lines[0])) { isChorus = true; lines = lines.slice(1); }
    lines = lines.map(l => l.replace(/^\d+\s+/, "").replace(/\[(estribillo|coro|refrain|chorus)\]/gi, "").trim()).filter(Boolean);
    if (!lines.length) continue;
    if (isChorus) { if (!chorus) chorus = lines.join("\n"); continue; }
    verses.push(lines.join("\n"));
  }
  if (!verses.length) { rejected++; continue; }
  const allText = verses.join(" ").toLowerCase();
  if (!/[áéíóúñ¡¿]|\b(el|la|los|las|que|dios|señor)\b/.test(allText)) { rejected++; continue; }
  const stanzas: string[] = [];
  verses.forEach((v, i) => {
    stanzas.push(`Verse ${i + 1}\n${v}`);
    if (i === 0 && chorus) stanzas.push(`Chorus\n${chorus}`);
  });
  const chordPro = stanzas.join("\n\n");

  const firstLine = verses[0].split("\n")[0];
  if (existing.has(norm(firstLine))) continue;
  existing.add(norm(item.title));
  existing.add(norm(firstLine));

  const author = info["Author"] || null;
  const translator = info["Translator"] || null;
  const writer = author && translator ? `${author} · tr. ${translator}` : translator ? `tr. ${translator}` : author || item.authors.split(";")[0]?.trim() || "Anónimo";

  const scrRaw = html.match(/ccel\.org\/study\/([A-Za-z_0-9]+[:.][\d-]+)/)?.[1]?.replace(/_/g, " ") || null;
  const scr = scrRaw ? esRef(scrRaw) : null;

  const parentRow = findParentByTune(html);
  const title = info["Title"] || item.title;
  out.push({
    t: title, a: writer, y: null,
    th: parentRow?.themes ?? null, k: parentRow?.songKey ?? null, bpm: parentRow?.bpm ?? null,
    ts: parentRow?.timeSignature ?? null, scr, chordPro,
    parent: parentRow?.title ?? null,
    rel: parentRow ? `Spanish translation${translator ? ` · tr. ${translator}` : ""}` : null,
    src: srcHymnal
  });
  console.log(`  ok ${out.length}/${MAX} [${item.instances}] ${title}${parentRow ? ` -> ${parentRow.title}` : ""}`);
}
console.log(`\nAccepted ${out.length} of ${checked} checked (${rejected} rejected)`);
if (dry) process.exit(0);

const entries = out.sort((a, b) => a.t.localeCompare(b.t)).map(s => {
  const o: any = { t: s.t, a: s.a, y: s.y, th: s.th, k: s.k, bpm: s.bpm, ts: s.ts, lang: "Spanish", scr: s.scr, lic: "PD", cong: 0, chordPro: s.chordPro };
  if (s.parent) { o.parent = s.parent; o.rel = s.rel; }
  return `  ${JSON.stringify(o, null, 2).split("\n").join("\n  ")}`;
});
fs.writeFileSync(path.join(__dirname, "..", "src", "seed-data", "hymns-es-hymnary.ts"),
  `// Generated by tools/import-hymnary-spanish.ts — do not edit by hand.
// Public-domain Spanish hymn texts indexed by hymnary.org (each marked
// "Copyright: Public Domain" there). Harvested most-published-first.
// Attribution: Hymnary.org — see .notes/content-sources.md.
export const HYMNS_ES_HYMNARY = [
${entries.join(",\n")}
];
`);
console.log(`Wrote hymns-es-hymnary.ts (${out.length} songs)`);
const { execSync } = await import("child_process");
execSync("npx eslint --fix src/seed-data/hymns-es-hymnary.ts", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
