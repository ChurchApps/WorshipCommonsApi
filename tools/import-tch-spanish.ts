import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";
import { buildCatalog } from "../src/seed-data/catalog.js";

// Harvests the Spanish hymn pages of The Cyber Hymnal (hymntime.com/tch/non/spa/)
// via the Wayback Machine, same legal basis as import-cyberhymnal.ts: TCH's
// copyright page dedicates un-noticed material to the public domain. Pages with a
// copyright notice, or with a stated year after 1930, are skipped. Usage:
//   tsx tools/import-tch-spanish.ts [--dry]
// Emits src/seed-data/hymns-es-tch.ts and downloads tune MIDIs to seed-assets/midi.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetDir = path.join(__dirname, "seed-assets", "midi");
const dry = process.argv.includes("--dry");
const SITE = "http://www.hymntime.com/tch/";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’,¡!¿?()."]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

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

async function cdx(pattern: string): Promise<string[][] | null> {
  for (let a = 1; a <= 5; a++) {
    const r = await get(`http://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(pattern)}&output=json&collapse=urlkey&fl=original,timestamp,statuscode&filter=statuscode:200`);
    if (r) {
      const text = await r.text();
      if (text.trim().startsWith("[")) return JSON.parse(text);
    }
    await new Promise(x => setTimeout(x, a * 8000));
  }
  return null;
}

const stripTags = (s: string) => s.replace(/<[^>]+>/g, "").replace(/­/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

// --- Wayback snapshot list for the Spanish section ---
const pages = new Map<string, string>();
const rowsCdx = await cdx("hymntime.com/tch/non/spa*");
if (!rowsCdx) throw new Error("CDX query failed");
for (const [original, timestamp] of rowsCdx.slice(1)) {
  const m = original.match(/spa\/([a-z0-9_-]+\.htm)$/i);
  if (!m || m[1] === "spa.htm") continue;
  const prev = pages.get(m[1]);
  if (!prev || timestamp > prev) pages.set(m[1], timestamp);
}
console.log(`Archived Spanish hymn pages: ${pages.size}`);

// --- English title index (page path -> title) for parent resolution ---
const WBIDX = "http://web.archive.org/web/20130601000000id_/";
const pageToEnglish = new Map<string, string>();
for (const letter of "abcdefghijklmnopqrstuvwxyz") {
  const raw = await getText(`${WBIDX}${SITE}ttl/ttl-${letter}.htm`);
  if (!raw) continue;
  const html = raw.replace(/­/g, "");
  for (const m of html.matchAll(/href="\.\.\/(htm\/[^"]+\.htm)"[^>]*>([^<]+)</gi)) {
    let title = m[2].replace(/\s+/g, " ").trim();
    const inv = title.match(/^(.+), (The|A|An)$/);
    if (inv) title = `${inv[2]} ${inv[1]}`;
    if (!pageToEnglish.has(m[1])) pageToEnglish.set(m[1], title);
  }
}
console.log(`English index: ${pageToEnglish.size} pages`);

// --- Existing catalog for parent match + dedupe ---
const { rows } = buildCatalog("");
const byNorm = new Map<string, any>();
for (const r of rows) byNorm.set(norm(r.title), r);
const findParent = (englishTitle: string) => {
  const n = norm(englishTitle);
  return byNorm.get(n) || byNorm.get(n.replace(/^o /, "oh ")) || byNorm.get(n.replace(/^oh /, "o "))
    || byNorm.get(n.replace(/\bye\b/, "you")) || byNorm.get(n.replace(/\byou\b/, "ye")) || null;
};
// Exclude this tool's own previous output from dedupe so reruns regenerate cleanly.
const own = new Set<string>();
try {
  const { HYMNS_ES_TCH } = await import("../src/seed-data/hymns-es-tch.js");
  for (const s of HYMNS_ES_TCH as any[]) own.add(norm(s.t));
} catch { /* first run */ }
const existingSpanish = new Set<string>();
for (const r of rows.filter((x: any) => x.language === "Spanish" && !own.has(norm(x.title)))) {
  existingSpanish.add(norm(r.title));
  const first = (r.chordPro || "").split("\n").find((l: string) => l.trim() && !/^(Verse|Chorus|Coro)/i.test(l.trim()));
  if (first) existingSpanish.add(norm(first.replace(/\[[^\]]*\]/g, "")));
}

interface EsSong {
  t: string; a: string; y: number | null; th: string | null; k: string | null; bpm: number | null;
  ts: string | null; scr: string | null; cong: number; chordPro: string; parent: string | null; rel: string | null;
  midFile?: string;
}

const out: EsSong[] = [];
const midiMap: Record<string, { file: string; bytes: number }> = {};
let skipped = 0;
for (const [file, timestamp] of [...pages.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const raw = await getText(`http://web.archive.org/web/${timestamp}id_/${SITE}non/spa/${file}`);
  if (!raw) { console.error(`  skip ${file}: fetch failed`); skipped++; continue; }
  const html = raw.replace(/<!--[\s\S]*?-->/g, "");
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ");
  if (/(©|&copy;)\s*(19|20)\d\d|copyright\s+(19|20)\d\d|arrangement\s*(©|&copy;)/i.test(visible)) {
    console.error(`  skip ${file}: copyright notice`); skipped++; continue;
  }

  const title = stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
  if (!title) { console.error(`  skip ${file}: no title`); skipped++; continue; }

  // Lyrics: <p> stanzas inside the corpus text block(s). "Coro"/"Estribillo" labels
  // mark the chorus; repeat markers after later verses are dropped.
  const corpus = html.match(/<div id="corpus">([\s\S]*?)<\/div><\/div>\s*<\/body>/i)?.[1] || html.match(/<div id="corpus">([\s\S]*)<\/body>/i)?.[1];
  if (!corpus) { console.error(`  skip ${file}: no corpus`); skipped++; continue; }
  const verses: string[] = [];
  let chorus: string | null = null;
  for (const pm of corpus.matchAll(/<p([^>]*)>([\s\S]*?)<\/p>/gi)) {
    const attrs = pm[1];
    const body = pm[2].replace(/<br\s*\/?>/gi, "\n");
    const lines = body.split("\n").map(l => stripTags(l)).filter(Boolean);
    if (!lines.length) continue;
    const isChorusClass = /class="[^"]*chorus/i.test(attrs);
    const isLabel = lines.length === 1 && /^(coro|estribillo)[:.]?$/i.test(lines[0]);
    if (isLabel) continue;
    if (isChorusClass) { if (!chorus) chorus = lines.join("\n"); continue; }
    verses.push(lines.join("\n"));
  }
  if (!verses.length && !chorus) { console.error(`  skip ${file}: no stanzas`); skipped++; continue; }

  const stanzas: string[] = [];
  verses.forEach((v, i) => {
    stanzas.push(`Verse ${i + 1}\n${v}`);
    if (i === 0 && chorus) stanzas.push(`Chorus\n${chorus}`);
  });
  if (!verses.length && chorus) stanzas.push(`Chorus\n${chorus}`);
  const chordPro = stanzas.join("\n\n");

  const firstLine = verses[0]?.split("\n")[0] || chorus?.split("\n")[0] || "";
  if (existingSpanish.has(norm(title)) || existingSpanish.has(norm(firstLine))) {
    console.log(`  dup  ${file}: ${title} (already in catalog)`); continue;
  }
  existingSpanish.add(norm(title));
  if (firstLine) existingSpanish.add(norm(firstLine));

  // Credits: meta description reads "Letra: Author, YEAR (English Title); tr. Translator, YEAR. Música: ..."
  const desc = stripTags(html.match(/<meta name="description" content="([\s\S]*?)"/i)?.[1] || "");
  const letra = desc.match(/Letra:\s*([^;.]+)/i)?.[1]?.trim() || null;
  const trMatch = desc.match(/\btr\.\s*([^;.]+?)(?:,\s*(\d{4}))?[;.]/i);
  const translator = (trMatch?.[1]?.trim() || null) && trMatch![1].trim().replace(/\s*\((?:b\. )?\d{4}[-–]?[\d?]*\)/g, "").trim();
  const trYear = trMatch?.[2] ? parseInt(trMatch[2], 10) : null;
  const origYearM = letra?.match(/,\s*(\d{4})/);
  const origYear = origYearM ? parseInt(origYearM[1], 10) : null;
  const stripDates = (s: string | null) => s ? s.replace(/\s*\((?:b\. )?\d{4}[-–]?[\d?]*\)/g, "").trim() : s;
  const author = stripDates(letra ? letra.replace(/,\s*\d{4}.*$/, "").trim() : null);
  const year = trYear ?? origYear;
  if (year && year > 1930) { console.error(`  skip ${file}: year ${year} > 1930`); skipped++; continue; }

  // English original: credit line's (<span lang="en">Title</span>) or the hreflang=en alternate page.
  const lyricsP = html.match(/<p id="lyrics">([\s\S]*?)<\/p>/i)?.[1] || "";
  let englishTitle = stripTags(lyricsP.match(/<span lang="en(?:-us)?">([\s\S]*?)<\/span>/i)?.[1] || "");
  if (!englishTitle) {
    const alt = html.match(/<link rel="alternate" href="\.\.\/\.\.\/(htm\/[^"]+\.htm)" hreflang="en"/i)?.[1];
    if (alt) englishTitle = pageToEnglish.get(alt) || "";
  }
  const parentRow = englishTitle ? findParent(englishTitle) : null;

  const scr = stripTags(html.match(/<div class="marquee">([\s\S]*?)<\/div>/i)?.[1] || "").split("@")[1]?.trim() || null;

  const writer = author && translator ? `${author} · tr. ${translator}` : translator ? `tr. ${translator}` : author || "Anónimo";
  const rel = parentRow
    ? `Spanish translation${translator ? ` · tr. ${translator}` : ""}${trYear ? `, ${trYear}` : ""}`
    : null;

  const mid = html.match(/href="((?:\.\.\/)+mid\/[^"]+\.mid)"/i)?.[1];
  let midFile: string | undefined;
  if (mid && !dry) {
    midFile = `tch-${path.basename(mid)}`;
    const target = path.join(assetDir, midFile);
    if (!fs.existsSync(target)) {
      const midResp = await get(`http://web.archive.org/web/${timestamp}id_/${SITE}${mid.replace(/^(\.\.\/)+/, "")}`);
      if (midResp) {
        const buf = Buffer.from(await midResp.arrayBuffer());
        if (buf.subarray(0, 4).toString("latin1") === "MThd") fs.writeFileSync(target, buf);
        else midFile = undefined;
      } else midFile = undefined;
      await new Promise(r => setTimeout(r, 250));
    }
    if (midFile && fs.existsSync(path.join(assetDir, midFile))) midiMap[title] = { file: midFile, bytes: fs.statSync(path.join(assetDir, midFile)).size };
  }

  out.push({
    t: title, a: writer, y: year ?? parentRow?.year ?? null,
    th: parentRow?.themes ?? null, k: parentRow?.songKey ?? null, bpm: parentRow?.bpm ?? null,
    ts: parentRow?.timeSignature ?? null, scr, cong: 0, chordPro,
    parent: parentRow?.title ?? null, rel
  });
  console.log(`  ok   ${file}: ${title}${parentRow ? ` -> ${parentRow.title}` : ""}${midFile ? " [midi]" : ""}`);
}

console.log(`\nHarvested ${out.length}, skipped ${skipped}, existing dups ${pages.size - out.length - skipped}`);
if (dry) process.exit(0);

const entries = out.sort((a, b) => a.t.localeCompare(b.t)).map(s => {
  const o: any = { t: s.t, a: s.a, y: s.y, th: s.th, k: s.k, bpm: s.bpm, ts: s.ts, lang: "Spanish", scr: s.scr, lic: "PD", cong: s.cong, chordPro: s.chordPro };
  if (s.parent) { o.parent = s.parent; o.rel = s.rel; }
  return `  ${JSON.stringify(o, null, 2).split("\n").join("\n  ")}`;
});
fs.writeFileSync(path.join(__dirname, "..", "src", "seed-data", "hymns-es-tch.ts"),
  `// Generated by tools/import-tch-spanish.ts — do not edit by hand.
// Public-domain Spanish hymns from The Cyber Hymnal (hymntime.com/tch/non/spa/,
// salvaged via the Wayback Machine). Its copyright page dedicates un-noticed
// material to the public domain; pages with copyright notices or years after
// 1930 are excluded at import time. Attribution: The Cyber Hymnal,
// http://www.hymntime.com/tch/ — see .notes/content-sources.md.
export const HYMNS_ES_TCH = [
${entries.join(",\n")}
];
`);
console.log(`Wrote hymns-es-tch.ts (${out.length} songs)`);

const midiLines = Object.entries(midiMap).sort(([a], [b]) => a.localeCompare(b))
  .map(([t, m]) => `  ${JSON.stringify(t)}: { file: ${JSON.stringify(m.file)}, bytes: ${m.bytes} }`);
fs.writeFileSync(path.join(__dirname, "..", "src", "seed-data", "midi-map-es.ts"),
  `// Generated by tools/import-tch-spanish.ts — do not edit by hand.
// Tune MIDIs for the Spanish hymns, same source and legal basis as midi-map-tch.ts.
export const MIDI_MAP_ES: Record<string, { file: string; bytes: number }> = {
${midiLines.join(",\n")}
};
`);
console.log(`Wrote midi-map-es.ts (${midiLines.length} MIDIs)`);
const { execSync } = await import("child_process");
execSync("npx eslint --fix src/seed-data/hymns-es-tch.ts src/seed-data/midi-map-es.ts", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
