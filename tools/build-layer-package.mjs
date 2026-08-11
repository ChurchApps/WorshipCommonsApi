// Writes layer/nodejs/package.json with every runtime dependency from the root
// package.json, so the Lambda layer always matches the app's deps.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rootPkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const outDir = join(root, "layer/nodejs");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "package.json"), JSON.stringify({ name: "worshipcommons-api-layer", private: true, dependencies: rootPkg.dependencies }, null, 2) + "\n");
console.log(`[build-layer] ${Object.keys(rootPkg.dependencies).length} runtime deps written to layer/nodejs/package.json`);
