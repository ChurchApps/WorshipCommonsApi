// Vendors the content library's generated catalog.json into config/catalog.json.
// Run after changing the WorshipCommonsContent repo; commit the result.
// Usage: yarn sync-catalog   (library dir override: CONTENT_LIBRARY_DIR or argv[2])
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.resolve(process.argv[2] || process.env.CONTENT_LIBRARY_DIR || path.join(__dirname, "..", "..", "WorshipCommonsContent"));
const src = path.join(LIB, "catalog.json");
if (!fs.existsSync(src)) {
  console.error(`No catalog.json at ${LIB} — is the WorshipCommonsContent checkout there? (set CONTENT_LIBRARY_DIR)`);
  process.exit(1);
}
const target = path.join(__dirname, "..", "config", "catalog.json");
fs.copyFileSync(src, target);
const { rows, files } = JSON.parse(fs.readFileSync(target, "utf8"));
console.log(`config/catalog.json ← ${src} (${rows.length} songs, ${files.length} files)`);
