import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { buildCatalog } from "../src/seed-data/catalog.js";

// Finds a portrait and bio excerpt on Wikipedia for each distinct catalog writer,
// keeps only images Commons marks public domain / CC0, and writes
// src/seed-data/writer-map.ts + tools/seed-assets/writers/<slug>.jpg.
// Bio excerpts are the article's opening sentences (CC BY-SA, credited on-site).
// Usage: tsx tools/import-writer-portraits.ts
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetDir = path.join(__dirname, "seed-assets", "writers");
const UA = "WorshipCommonsImport/1.0 (https://worshipcommons.org; support@churchapps.org)";
const WIKI = "https://en.wikipedia.org/w/api.php";
const COMMONS = "https://commons.wikimedia.org/w/api.php";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const getJson = async (url: string) => {
  for (let attempt = 0; ; attempt++) {
    const resp = await fetch(url, { headers: { "user-agent": UA } });
    if (resp.status === 429 && attempt < 4) { await sleep(5000 * (attempt + 1)); continue; }
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }
};
const slugFor = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const PERSONISH = /hymn|compos|minist|poet|writer|pastor|clerg|music|evangel|preach|priest|monk|reformer|theolog|missionar|bishop|author/i;

const cleanName = (writer: string) => writer.split("·")[0].replace(/\(.*?\)/g, "").trim();
const skippable = (name: string) => /trad\.?|anonymous|unknown|\d+(st|nd|rd|th) c|century|various/i.test(name) || name.split(" ").length < 2;

async function lookup(writer: string) {
  const name = cleanName(writer);
  if (skippable(name)) return null;

  const search = await getJson(`${WIKI}?action=query&list=search&srsearch=${encodeURIComponent(name + " hymn")}&srlimit=3&format=json`);
  const surname = name.split(" ").pop()!.toLowerCase();
  const hit = (search.query?.search || []).find((s: any) => s.title.toLowerCase().includes(surname));
  if (!hit) return null;

  const summary = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title.replace(/ /g, "_"))}`);
  if (summary.type !== "standard" || !summary.extract || !PERSONISH.test(summary.extract + " " + (summary.description || ""))) return null;

  const pi = await getJson(`${WIKI}?action=query&titles=${encodeURIComponent(hit.title)}&prop=pageimages&piprop=name&format=json`);
  const imageName = (Object.values(pi.query?.pages || {})[0] as any)?.pageimage;
  if (!imageName) return null;

  const ii = await getJson(`${COMMONS}?action=query&titles=${encodeURIComponent("File:" + imageName)}&prop=imageinfo&iiprop=extmetadata|url&iiurlwidth=330&format=json`);
  const info = (Object.values(ii.query?.pages || {})[0] as any)?.imageinfo?.[0];
  const license = info?.extmetadata?.LicenseShortName?.value || "";
  if (!info?.thumburl || !/public domain|^pd|cc0/i.test(license)) return null;

  return { article: summary.content_urls?.desktop?.page || "", bio: excerpt(summary.extract), thumbUrl: info.thumburl, license };
}

// prefix-cut at a sentence end, never after an initial like "O." — avoids mangling "O. Cist." etc.
function excerpt(text: string) {
  const t = String(text).replace(/\s+/g, " ").trim();
  if (t.length <= 320) return t;
  const cut = t.slice(0, 320);
  const ends = [...cut.matchAll(/(?<![ .][A-Z])[.!?](?= |$)/g)].map(m => m.index as number);
  return ends.length ? cut.slice(0, ends[ends.length - 1] + 1) : cut.replace(/\s+\S*$/, "") + "…";
}

const { rows } = buildCatalog("");
const writers = [...new Set(rows.map((r: any) => r.writer as string))].sort();
console.log(`${writers.length} distinct writers`);

fs.mkdirSync(assetDir, { recursive: true });
const map: Record<string, { slug: string; bio: string; article: string }> = {};
const byName = new Map<string, Awaited<ReturnType<typeof lookup>>>(); // "X · tr. Y" variants share one lookup
for (const writer of writers) {
  try {
    const name = cleanName(writer);
    const found = byName.has(name) ? byName.get(name) : await lookup(writer);
    byName.set(name, found);
    if (!found) { console.log(`  -- ${writer}`); continue; }
    const slug = slugFor(cleanName(writer));
    const target = path.join(assetDir, `${slug}.jpg`);
    if (!fs.existsSync(target)) {
      const resp = await fetch(found.thumbUrl, { headers: { "user-agent": UA } });
      if (!resp.ok) { console.log(`  -- ${writer}: image HTTP ${resp.status}`); continue; }
      fs.writeFileSync(target, Buffer.from(await resp.arrayBuffer()));
    }
    map[writer] = { slug, bio: found.bio, article: found.article };
    console.log(`  ok ${writer} [${found.license}] ${found.article}`);
  } catch (e: any) {
    console.log(`  !! ${writer}: ${e.message}`);
  }
  await sleep(200);
}

const lines = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  .map(([w, m]) => `  ${JSON.stringify(w)}: { slug: ${JSON.stringify(m.slug)}, bio: ${JSON.stringify(m.bio)}, article: ${JSON.stringify(m.article)} }`);
fs.writeFileSync(path.join(__dirname, "..", "src", "seed-data", "writer-map.ts"),
  `// Generated by tools/import-writer-portraits.ts — do not edit by hand.
// Public-domain portraits and bio excerpts for catalog writers, via Wikipedia/Wikimedia Commons.
// Portraits are Commons-verified PD/CC0; bios are article openings (CC BY-SA, credited on-site).
export interface WriterInfo { slug: string; bio: string; article: string; }
export const WRITER_MAP: Record<string, WriterInfo> = {
${lines.join(",\n")}
};
`);
console.log(`Wrote writer-map.ts (${lines.length} of ${writers.length} writers)`);
const { execSync } = await import("child_process");
execSync("npx eslint --fix src/seed-data/writer-map.ts", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
