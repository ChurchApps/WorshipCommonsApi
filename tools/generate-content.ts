import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { buildCatalog } from "../src/seed-data/catalog.js";

// Lays out the catalog's content files (PD melody MIDIs and lyric timings from tools/seed-assets)
// for syncing to a stage's content bucket: tsx tools/generate-content.ts <outDir> <contentRoot>
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [outDir, contentRoot] = process.argv.slice(2);
if (!outDir || !contentRoot) {
  console.error("Usage: tsx tools/generate-content.ts <outDir> <contentRoot>");
  process.exit(1);
}

const { files } = buildCatalog(contentRoot);
for (const f of files) {
  const target = path.join(outDir, ...f.key.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(__dirname, "seed-assets", ...f.src.split("/")), target);
}
console.log(`Laid out ${files.length} content files in ${outDir}`);
