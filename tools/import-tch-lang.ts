import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";
import { buildCatalog } from "../src/seed-data/catalog.js";

// Harvests non-English hymn sections of The Cyber Hymnal via the Wayback Machine.
// Generalization of import-tch-spanish.ts to any TCH language directory; same
// legal basis: TCH's copyright page dedicates un-noticed material to the public
// domain, and newer pages carry an explicit class="public-domain" dedication.
// Skipped: pages with a copyright notice, or with a credit year after 1930 that
// lacks the public-domain marker. Usage:
//   tsx tools/import-tch-lang.ts [--dry] [de fr pt ru ml sq hu]
// Emits src/seed-data/hymns-tch-<code>.ts (hymns + tune-MIDI map) per language
// and downloads MIDIs to seed-assets/midi. Attribution: The Cyber Hymnal,
// http://www.hymntime.com/tch/ — see .notes/content-sources.md.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetDir = path.join(__dirname, "seed-assets", "midi");
const dry = process.argv.includes("--dry");
const SITE = "http://www.hymntime.com/tch/";

// dirs newest-scheme first so the newer page wins the title dedupe
const LANGS = [
  { code: "de", dirs: ["de", "deu"], name: "German" },
  { code: "fr", dirs: ["fr", "fra"], name: "French" },
  { code: "pt", dirs: ["pt"], name: "Portuguese" },
  { code: "ru", dirs: ["ru", "rus"], name: "Russian" },
  { code: "ml", dirs: ["ml", "mal"], name: "Malayalam" },
  { code: "sq", dirs: ["sq", "sqi"], name: "Albanian" },
  { code: "hu", dirs: ["hu"], name: "Hungarian" }
];
const picked = process.argv.slice(2).filter(a => !a.startsWith("--"));
const langs = picked.length ? LANGS.filter(l => picked.includes(l.code)) : LANGS;
if (picked.length && langs.length !== picked.length) throw new Error(`Unknown language code in: ${picked.join(" ")}`);

// unicode-aware: keeps non-Latin scripts (Cyrillic, Malayalam) distinct
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").trim();

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

const stripTags = (s: string) => s.replace(/<\/?q>/g, '"').replace(/<[^>]+>/g, "").replace(/­/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const stripDates = (s: string | null) => s ? s.replace(/\s*\((?:b\. )?\d{4}[-–]?[\d?]*\)/g, "").trim() : s;

// --- English title index (page basename -> title) for hreflang parent fallback ---
const WBIDX = "http://web.archive.org/web/20130601000000id_/";
const pageToEnglish = new Map<string, string>();
for (const letter of "abcdefghijklmnopqrstuvwxyz") {
  const raw = await getText(`${WBIDX}${SITE}ttl/ttl-${letter}.htm`);
  if (!raw) continue;
  const html = raw.replace(/­/g, "");
  for (const m of html.matchAll(/href="\.\.\/htm\/([^"]+\.htm)"[^>]*>([^<]+)</gi)) {
    let title = m[2].replace(/\s+/g, " ").trim();
    const inv = title.match(/^(.+), (The|A|An)$/);
    if (inv) title = `${inv[2]} ${inv[1]}`;
    const base = path.posix.basename(m[1]);
    if (!pageToEnglish.has(base)) pageToEnglish.set(base, title);
  }
}
console.log(`English index: ${pageToEnglish.size} pages`);

// --- Existing catalog for parent match + global title dedupe ---
const { rows } = buildCatalog("");
const byNorm = new Map<string, any>();
for (const r of rows) byNorm.set(norm(r.title), r);
const findParent = (t: string) => {
  const n = norm(t);
  return byNorm.get(n) || byNorm.get(n.replace(/^o /, "oh ")) || byNorm.get(n.replace(/^oh /, "o "))
    || byNorm.get(n.replace(/\bye\b/, "you")) || byNorm.get(n.replace(/\byou\b/, "ye")) || null;
};
// Exclude this tool's own previous outputs from dedupe so reruns regenerate cleanly.
const own = new Set<string>();
for (const l of LANGS) {
  try {
    const mod: any = await import(`../src/seed-data/hymns-tch-${l.code}.js`);
    for (const s of mod[`HYMNS_TCH_${l.code.toUpperCase()}`] || []) own.add(norm(s.t));
  } catch { /* not generated yet */ }
}
const seenTitles = new Set<string>();
const seenFirstLines = new Map<string, Set<string>>(); // per language
for (const r of rows) {
  if (own.has(norm(r.title))) continue;
  seenTitles.add(norm(r.title));
  const first = (r.chordPro || "").split("\n").find((l: string) => l.trim() && !/^(Verse|Chorus|Coro)/i.test(l.trim()));
  if (first) {
    if (!seenFirstLines.has(r.language)) seenFirstLines.set(r.language, new Set());
    seenFirstLines.get(r.language)!.add(norm(first.replace(/\[[^\]]*\]/g, "")));
  }
}

const CHORUS_LABEL = /^(coro|estribillo|chorus|refrain|refrão|refrén|refreni|kórus|kar|kehrvers|припев)[:.]?$/iu;

interface LangSong {
  t: string; a: string; y: number | null; th: string | null; k: string | null; bpm: number | null;
  ts: string | null; scr: string | null; chordPro: string; parent: string | null; rel: string | null;
}

for (const L of langs) {
  console.log(`\n===== ${L.name} (${L.dirs.join(", ")})`);
  const firstLines = seenFirstLines.get(L.name) || new Set<string>();
  seenFirstLines.set(L.name, firstLines);

  // Wayback snapshot list: newest scheme first, dedupe by page basename across dirs
  const pages: { url: string; timestamp: string; file: string }[] = [];
  const seenBase = new Set<string>();
  for (const dir of L.dirs) {
    const rowsCdx = await cdx(`hymntime.com/tch/non/${dir}/*`);
    if (!rowsCdx) { console.error(`  CDX query failed for ${dir}, skipping dir`); continue; }
    const best = new Map<string, { url: string; timestamp: string }>();
    const re = new RegExp(`/non/${dir}/((?:[a-z0-9_\\-]+/)*[a-z0-9_\\-]+\\.htm)$`, "i");
    for (const [original, timestamp] of rowsCdx.slice(1)) {
      const m = original.match(re);
      if (!m || new RegExp(`^(index|${dir})\\.htm$`).test(path.posix.basename(m[1]))) continue;
      const prev = best.get(m[1]);
      if (!prev || timestamp > prev.timestamp) best.set(m[1], { url: original, timestamp });
    }
    for (const [file, v] of [...best.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const base = path.posix.basename(file).replace(new RegExp(`_(?:${L.dirs.join("|")})\\.htm$`), ".htm");
      if (seenBase.has(base)) continue;
      seenBase.add(base);
      pages.push({ url: v.url, timestamp: v.timestamp, file });
    }
  }
  console.log(`  archived pages: ${pages.length}`);

  const out: LangSong[] = [];
  const midiMap: Record<string, { file: string; bytes: number }> = {};
  let skipped = 0;
  for (const { url, timestamp, file } of pages) {
    const raw = await getText(`http://web.archive.org/web/${timestamp}id_/${url}`);
    if (!raw) { console.error(`  skip ${file}: fetch failed`); skipped++; continue; }
    const html = raw.replace(/<!--[\s\S]*?-->/g, "");
    const visible = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ");
    const isPD = /class="public-domain"/i.test(html);
    if (!isPD && /(©|&copy;)\s*(19|20)\d\d|copyright\s+(19|20)\d\d|arrangement\s*(©|&copy;)/i.test(visible)) {
      console.error(`  skip ${file}: copyright notice`); skipped++; continue;
    }

    const title = stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
    if (!title) { console.error(`  skip ${file}: no title`); skipped++; continue; }

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
      if (lines.length === 1 && CHORUS_LABEL.test(lines[0])) continue;
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
    if (seenTitles.has(norm(title)) || (firstLine && firstLines.has(norm(firstLine)))) {
      console.log(`  dup  ${file}: ${title} (already in catalog)`); continue;
    }

    // Credits paragraph: id varies by site era (lyrics -> credits -> words).
    // Author = first non-translator bio link; translator = class="xlat-en" link;
    // original-language title = first classless <span lang="..">.
    const creditP = html.match(/<p id="(?:lyrics|credits|words)">([\s\S]*?)<\/p>/i)?.[1] || "";
    let author: string | null = null;
    for (const am of creditP.matchAll(/<a\s([^>]*)>([\s\S]*?)<\/a>/gi)) {
      if (!/\/bio\//.test(am[1]) || /class="[^"]*xlat/.test(am[1])) continue;
      author = stripDates(stripTags(am[2])); break;
    }
    if (!author) author = stripTags(html.match(/<meta name="keywords" content="([^"]*)"/i)?.[1]?.split(",")[0] || "") || null;
    const authorYear = creditP ? parseInt(stripTags(creditP).match(/\b(1[5-9]\d\d|20\d\d)\b/)?.[1] || "", 10) || null : null;
    const trM = creditP.match(/<a\s[^>]*class="[^"]*xlat-en[^>]*>([\s\S]*?)<\/a>\s*,?\s*((?:1[5-9]|20)\d\d)?/i);
    const translator = trM ? stripDates(stripTags(trM[1])) : null;
    const trYear = trM?.[2] ? parseInt(trM[2], 10) : null;
    const origSpan = stripTags(creditP.match(/<span lang="[a-z-]+">([\s\S]*?)<\/span>/i)?.[1] || "");
    const isTranslation = !!translator || !!origSpan || /class="xlat-unk"/i.test(creditP);

    const year = trYear ?? authorYear;
    if (year && year > 1930 && !isPD) { console.error(`  skip ${file}: year ${year} > 1930, no PD marker`); skipped++; continue; }

    // Parent: original-title span, else the hreflang=en alternate page via English index
    let parentRow = origSpan ? findParent(origSpan) : null;
    if (!parentRow) {
      const alt = html.match(/<link rel="alternate" href="[^"]*\/(?:htm|non)\/([^"]+\.htm)" hreflang="en"/i)?.[1];
      const altTitle = alt ? pageToEnglish.get(path.posix.basename(alt)) : null;
      if (altTitle) parentRow = findParent(altTitle);
    }

    const scr = stripTags(html.match(/<div class="marquee">([\s\S]*?)<\/div>/i)?.[1] || "").split("@")[1]?.trim() || null;
    const writer = author && translator ? `${author} · tr. ${translator}` : translator ? `tr. ${translator}` : author || "Anonymous";
    const rel = parentRow
      ? isTranslation
        ? `${L.name} translation${translator ? ` · tr. ${translator}` : ""}${trYear ? `, ${trYear}` : ""}`
        : `${L.name} original${author ? ` · ${author}` : ""}${authorYear ? `, ${authorYear}` : ""}`
      : null;

    const mid = html.match(/href="((?:\.\.\/)+mid\/[^"]+\.mid)"/i)?.[1];
    let midFile: string | undefined;
    if (mid && !dry) {
      midFile = `tch-${path.posix.basename(mid)}`;
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

    seenTitles.add(norm(title));
    if (firstLine) firstLines.add(norm(firstLine));
    out.push({
      t: title, a: writer, y: year ?? parentRow?.year ?? null,
      th: parentRow?.themes ?? null, k: parentRow?.songKey ?? null, bpm: parentRow?.bpm ?? null,
      ts: parentRow?.timeSignature ?? null, scr, chordPro,
      parent: parentRow?.title ?? null, rel
    });
    console.log(`  ok   ${file}: ${title}${parentRow ? ` -> ${parentRow.title}` : ""}${midFile ? " [midi]" : ""}`);
  }

  console.log(`  harvested ${out.length}, skipped ${skipped}, dups ${pages.length - out.length - skipped}`);
  if (dry) continue;

  const entries = out.sort((a, b) => a.t.localeCompare(b.t)).map(s => {
    const o: any = { t: s.t, a: s.a, y: s.y, th: s.th, k: s.k, bpm: s.bpm, ts: s.ts, lang: L.name, scr: s.scr, lic: "PD", cong: 0, chordPro: s.chordPro };
    if (s.parent) { o.parent = s.parent; o.rel = s.rel; }
    return `  ${JSON.stringify(o, null, 2).split("\n").join("\n  ")}`;
  });
  const midiLines = Object.entries(midiMap).sort(([a], [b]) => a.localeCompare(b))
    .map(([t, m]) => `  ${JSON.stringify(t)}: { file: ${JSON.stringify(m.file)}, bytes: ${m.bytes} }`);
  const CODE = L.code.toUpperCase();
  fs.writeFileSync(path.join(__dirname, "..", "src", "seed-data", `hymns-tch-${L.code}.ts`),
    `// Generated by tools/import-tch-lang.ts — do not edit by hand.
// Public-domain ${L.name} hymns from The Cyber Hymnal (hymntime.com/tch/non/,
// salvaged via the Wayback Machine). Its copyright page dedicates un-noticed
// material to the public domain, and newer pages carry an explicit
// public-domain dedication; pages with copyright notices, or post-1930 credit
// years without that dedication, are excluded at import time.
// Attribution: The Cyber Hymnal, http://www.hymntime.com/tch/ — see .notes/content-sources.md.
export const HYMNS_TCH_${CODE} = [
${entries.join(",\n")}
];

// Tune MIDIs, same source and legal basis.
export const MIDI_TCH_${CODE}: Record<string, { file: string; bytes: number }> = {
${midiLines.join(",\n")}
};
`);
  console.log(`  wrote hymns-tch-${L.code}.ts (${out.length} songs, ${midiLines.length} MIDIs)`);
}

if (!dry) {
  const { execSync } = await import("child_process");
  execSync(`npx eslint --fix ${langs.map(l => `src/seed-data/hymns-tch-${l.code}.ts`).join(" ")}`, { cwd: path.join(__dirname, ".."), stdio: "inherit" });
}
