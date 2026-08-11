#!/usr/bin/env node

// Post-build script: adds .js extensions to relative imports in compiled ESM output.
// Node.js ESM requires explicit file extensions, but TypeScript with "bundler"
// moduleResolution doesn't add them.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "..", "dist");

function resolveImport(fromFile, importPath) {
  const dir = path.dirname(fromFile);
  const resolved = path.resolve(dir, importPath);

  // Check if it's a directory (or bare "." / "..") with an index.js
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    return importPath + "/index.js";
  }
  return importPath + ".js";
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const updated = content
    .replace(/(from\s+["'])(\.\.?(?:\/[^"']*)?)(["'])/g, (match, prefix, importPath, suffix) => {
      if (importPath.endsWith(".js") || importPath.endsWith(".json")) return match;
      return `${prefix}${resolveImport(filePath, importPath)}${suffix}`;
    })
    .replace(/(import\s*\(\s*["'])(\.\.?(?:\/[^"']*)?)(["']\s*\))/g, (match, prefix, importPath, suffix) => {
      if (importPath.endsWith(".js") || importPath.endsWith(".json")) return match;
      return `${prefix}${resolveImport(filePath, importPath)}${suffix}`;
    });

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf8");
  }
}

function walkDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.name.endsWith(".js")) {
      fixFile(fullPath);
    }
  }
}

walkDir(distDir);
console.log("ESM import extensions fixed.");
