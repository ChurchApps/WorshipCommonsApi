import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Imports Open Hymnal Project (openhymnal.org) content:
//   tsx tools/import-openhymnal.ts <dir>   (dir holds abc/*.abc + midi/*.mid from the OH bulk zips)
// Only hymns whose ABC copyright line declares the whole score public domain are used.
// Generates src/seed-data/hymns-oh.ts + src/seed-data/midi-map.ts and copies the
// referenced MIDI files into tools/seed-assets/midi/ and their ABC masters into
// tools/seed-assets/abc/ (ABC is the tune's source of truth — see .notes/source-of-truth.md).
// Rerunning rewrites hymns-oh.ts from the raw ABC lyrics: follow with backfill-chords.py
// (idempotent) and trim-midi-tails.py, or the backfilled chords and trimmed tails are lost.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = process.argv[2];
if (!srcDir) { console.error("Usage: tsx tools/import-openhymnal.ts <openhymnal-dir>"); process.exit(1); }

const PD_RE = /^(public domain|words, public domain\.\s*adaptation released into public domain|music and setting public domain\.$)/i;

interface Parsed {
  file: string; title: string; author: string; translator: string; composer: string;
  year: number | null; themes: string; key: string; meter: string; bpm: number | null;
  scripture: string; pd: boolean; stanzas: { label: string; lines: string[] }[];
}

function parseName(raw: string): string {
  const names = raw.split(";").map(n => {
    const clean = n.replace(/\(.*?\)/g, "").trim();
    if (!clean || /^(none|unknown|anonymous|traditional)$/i.test(clean)) return "";
    const m = clean.match(/^([^,]+),\s*(.+)$/);
    return m ? `${m[2].trim()} ${m[1].trim()}` : clean;
  }).filter(Boolean);
  return names.join(" & ");
}

function cleanLyric(l: string): string {
  return l
    .replace(/^w:\s*/, "")
    .replace(/^\d+\.\s*~?\s*/, "")
    .replace(/!\w+!/g, "")
    .replace(/[*_|\\]/g, "")
    .replace(/~/g, " ")
    .replace(/([A-Za-z])-\s+/g, "$1")
    .replace(/([,.;:!?])-\s*/g, "$1 ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function parseAbc(file: string): Parsed | null {
  const text = fs.readFileSync(path.join(srcDir, "abc", file), "utf8");
  const lines = text.split(/\r?\n/);

  const field = (re: RegExp) => { const m = text.match(re); return m ? m[1].trim() : ""; };
  const title = field(/^T:\s*(.+)$/m);
  if (!title) return null;

  const copyright = field(/^C:\s*copyright:\s*(.+)$/im);
  const pd = PD_RE.test(copyright);

  const author = parseName(field(/^%OHAUTHOR\s*(.+)$/m));
  const translator = parseName(field(/^%OHTRANSLATOR\s*(.+)$/m));
  const composer = parseName(field(/^%OHCOMPOSER\s*(.+)$/m));

  const wordsLine = field(/^C:\s*(Words:.+)$/m);
  const musicLine = field(/^C:\s*(Music:.+)$/m);
  const yearMatch = wordsLine.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/) || musicLine.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

  const topicsRaw = field(/^%OHTOPICS\s*(.+)$/m);
  const themes = [...topicsRaw.matchAll(/\{([^}]+)\}/g)]
    .map(m => m[1].replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim())
    .filter(t => t && !t.includes(","))
    .slice(0, 3)
    .join(",");

  const scripture = field(/^%OHSCRIP\s*(.+)$/m).split(",")[0].trim();

  const keyRaw = field(/^K:\s*([^%\r\n]+)/m).trim();
  const km = keyRaw.match(/^([A-G][#b]?)\s*(m\b|min\w*)?/i);
  const key = km ? km[1] + (km[2] ? "m" : "") : "C";

  const meterRaw = field(/^M:\s*([^%\r\n]+)/m).trim();
  const meter = /^\d+\/\d+$/.test(meterRaw) ? meterRaw : "";

  const qm = text.match(/Q:\s*(\d+)\/(\d+)\s*=\s*(\d+)/);
  const bpm = qm ? Math.min(200, Math.max(40, Math.round(parseInt(qm[3], 10) * (parseInt(qm[1], 10) / parseInt(qm[2], 10)) * 4))) : null;

  // lyric groups: consecutive w: lines under the melody (first) voice
  let melodyVoice = "";
  const stavesM = text.match(/%%staves\s*\(?\s*(\S+?)[\s)]/);
  if (stavesM) melodyVoice = stavesM[1];
  let current = "";
  const groups: string[][] = [];
  let group: string[] | null = null;
  for (const l of lines) {
    const vm = l.match(/^\[V:\s*(\S+?)\]/);
    if (vm) {
      current = vm[1];
      if (!melodyVoice) melodyVoice = current;
      if (current === melodyVoice) { group = []; groups.push(group); }
      continue;
    }
    if (/^w:/.test(l) && current === melodyVoice && group) {
      const c = cleanLyric(l);
      if (c) group.push(c);
    }
  }
  const nonEmpty = groups.filter(g => g.length > 0);
  if (nonEmpty.length === 0) return { file, title, author, translator, composer, year, themes, key, meter, bpm, scripture, pd, stanzas: [] };

  const verseCount = Math.max(...nonEmpty.map(g => g.length));
  const verses: string[][] = Array.from({ length: verseCount }, () => []);
  const chorus: string[] = [];
  for (const g of nonEmpty) {
    if (g.length === verseCount) g.forEach((l, i) => verses[i].push(l));
    else g.forEach(l => chorus.push(l));
  }
  const stanzas = verses.filter(v => v.length > 0).map((v, i) => ({ label: `Verse ${i + 1}`, lines: v }));
  if (chorus.length > 0) stanzas.push({ label: "Chorus", lines: chorus });
  return { file, title, author, translator, composer, year, themes, key, meter, bpm, scripture, pd, stanzas };
}

const abcFiles = fs.readdirSync(path.join(srcDir, "abc")).filter(f => f.endsWith(".abc")).sort();
const parsed = abcFiles.map(parseAbc).filter((p): p is Parsed => p !== null);
const pdHymns = parsed.filter(p => p.pd);
console.log(`Parsed ${parsed.length} ABC files, ${pdHymns.length} fully public domain (${parsed.length - pdHymns.length} excluded)`);

const norm = (s: string) => s.toLowerCase().replace(/['’,!()."]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

// index every hyphen-separated segment (title and tune names) of each PD file's basename
const segIndex = new Map<string, string>();
for (const p of pdHymns) {
  for (const part of p.file.replace(/\.abc$/, "").split("-")) {
    const k = norm(part.replace(/_/g, " "));
    if (!segIndex.has(k)) segIndex.set(k, p.file);
  }
}

// existing songs that share a tune under a different title
const ALIAS: Record<string, string> = {
  "Doxology": "old 100th",
  "Ein feste Burg ist unser Gott": "ein feste burg rhythmic",
  "Castillo Fuerte": "ein feste burg rhythmic",
  "Stille Nacht": "stille nacht",
  "Noche de Paz": "stille nacht",
  "Santo, Santo, Santo": "nicaea",
  "Adeste Fideles": "adeste fideles",
  "O God, Our Help in Ages Past": "st anne",
  "Jesus, Lover of My Soul": "aberystwyth",
  "Come, Thou Almighty King": "italian hymn",
  "O For a Thousand Tongues to Sing": "azmon",
  "While Shepherds Watched Their Flocks": "winchester old",
  "Once in Royal David's City": "irby",
  "Good Christian Men, Rejoice": "in dulci jubilo",
  "It Came Upon the Midnight Clear": "carol",
  "Lo! He Comes with Clouds Descending": "helmsley",
  "Fairest Lord Jesus": "crusaders hymn",
  "The King of Love My Shepherd Is": "st columba"
};

const { buildCatalog } = await import("../src/seed-data/catalog.js");
const { HYMNS_OH } = await import("../src/seed-data/hymns-oh.js");
const { idFor } = await import("../src/seed-data/catalog.js");
const ohIds = new Set(HYMNS_OH.map((h: any) => idFor(h.t)));
const baseRows = buildCatalog("").rows.filter((r: any) => !ohIds.has(r.id));

// 1) map every base catalog song to a PD MIDI where one exists
const midiMap: Record<string, string> = {};
for (const r of baseRows) {
  const n = norm(r.title);
  const f = segIndex.get(n) || segIndex.get(n.replace(/^o /, "oh ")) || segIndex.get(n.replace(/^oh /, "o "))
    || (ALIAS[r.title] && segIndex.get(norm(ALIAS[r.title])));
  if (f) midiMap[r.title] = f.replace(/\.abc$/, ".mid");
}

// 2) expansion: PD hymns with lyrics whose title isn't already in the catalog
const variants = (t: string) => { const n = norm(t); return [n, n.replace(/^o /, "oh "), n.replace(/^oh /, "o "), n.replace(/\bye\b/g, "you"), n.replace(/\byou\b/g, "ye")]; };
const existingNorm = new Set(baseRows.flatMap((r: any) => variants(r.title)));
const seen = new Set<string>();
const expansion: Parsed[] = [];
for (const p of pdHymns) {
  if (p.stanzas.length === 0) continue;
  if (variants(p.title).some(v => existingNorm.has(v) || seen.has(v))) continue;
  seen.add(norm(p.title));
  expansion.push(p);
  midiMap[p.title] = p.file.replace(/\.abc$/, ".mid");
}
console.log(`MIDI matches for existing songs: ${Object.keys(midiMap).length - expansion.length}, expansion hymns: ${expansion.length}`);

// copy referenced MIDIs + their ABC masters into seed assets
const assetDir = path.join(__dirname, "seed-assets", "midi");
const abcDir = path.join(__dirname, "seed-assets", "abc");
fs.rmSync(abcDir, { recursive: true, force: true });
fs.mkdirSync(assetDir, { recursive: true });
fs.mkdirSync(abcDir, { recursive: true });
// only OH-owned files — tch-/umh midis belong to the other importers
for (const f of fs.readdirSync(assetDir)) {
  if (!/^(tch-|umh)/.test(f)) fs.rmSync(path.join(assetDir, f));
}
const bytes: Record<string, number> = {};
for (const mid of new Set(Object.values(midiMap))) {
  const src = path.join(srcDir, "midi", mid);
  if (!fs.existsSync(src)) { console.error(`Missing MIDI: ${mid}`); process.exit(1); }
  fs.copyFileSync(src, path.join(assetDir, mid));
  bytes[mid] = fs.statSync(src).size;
  const abc = mid.replace(/\.mid$/, ".abc");
  fs.copyFileSync(path.join(srcDir, "abc", abc), path.join(abcDir, abc));
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
const q = (s: string) => JSON.stringify(s);

const mapLines = Object.entries(midiMap).sort(([a], [b]) => a.localeCompare(b))
  .map(([t, f]) => `  ${q(t)}: { file: ${q(f)}, bytes: ${bytes[f]} }`);
fs.writeFileSync(path.join(__dirname, "..", "src", "seed-data", "midi-map.ts"),
  `// Generated by tools/import-openhymnal.ts — do not edit by hand.
// Melody MIDI files from the Open Hymnal Project (openhymnal.org), each verified
// public domain via the copyright line in its ABC source.
export const MIDI_MAP: Record<string, { file: string; bytes: number }> = {
${mapLines.join(",\n")}
};
`);

const entries = expansion.map(p => {
  const writer = [p.author || p.composer, p.translator && `tr. ${p.translator}`].filter(Boolean).join(" · ");
  const chordPro = p.stanzas.map(s => [s.label, ...s.lines].join("\n")).join("\n\n");
  const fields = [
    `t: ${q(p.title)}`,
    `a: ${q(writer || "Unknown")}`,
    `y: ${p.year ?? "null"}`,
    `th: ${q(p.themes)}`,
    `k: ${q(p.key)}`,
    `bpm: ${p.bpm ?? 90}`,
    `ts: ${q(p.meter || "4/4")}`,
    `lang: "English"`,
    `scr: ${q(p.scripture)}`,
    `lic: "PD"`,
    `cong: 0`
  ];
  return `  {\n    ${fields.join(", ")},\n    chordPro: \`${esc(chordPro)}\`\n  }`;
});
fs.writeFileSync(path.join(__dirname, "..", "src", "seed-data", "hymns-oh.ts"),
  `// Generated by tools/import-openhymnal.ts — do not edit by hand.
// Public-domain hymns imported from the Open Hymnal Project (openhymnal.org).
// Words, music, and settings all verified public domain via each ABC source's
// copyright line. Lyrics reconstructed from the ABC w: fields of the melody voice.
export const HYMNS_OH = [
${entries.join(",\n")}
];
`);
console.log(`Wrote hymns-oh.ts (${expansion.length} hymns), midi-map.ts (${Object.keys(midiMap).length} songs), ${Object.keys(bytes).length} MIDI files in seed-assets`);
const { execSync } = await import("child_process");
execSync("npx eslint --fix src/seed-data/hymns-oh.ts src/seed-data/midi-map.ts", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
