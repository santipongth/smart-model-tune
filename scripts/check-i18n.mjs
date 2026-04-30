#!/usr/bin/env node
/**
 * Scan for unused i18n keys.
 *
 * Reads keys from src/i18n/translations.ts (English block) and greps the rest
 * of src/ for usages like t("key"), t('key'), t(`key`), or "key" / 'key'
 * appearing in code (covers titleKey: "..." style indirection).
 *
 * Usage:
 *   node scripts/check-i18n.mjs            # report only (exit 0)
 *   node scripts/check-i18n.mjs --strict   # exit 1 if unused keys found
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const TRANSLATIONS = join(ROOT, "src/i18n/translations.ts");
const SRC = join(ROOT, "src");
const STRICT = process.argv.includes("--strict");

// 1. Extract keys from translations.ts (en block only — th mirrors it).
const file = readFileSync(TRANSLATIONS, "utf8");
const enStart = file.indexOf("en:");
const thStart = file.indexOf("th:", enStart);
const enBlock = file.slice(enStart, thStart > 0 ? thStart : file.length);
const keyRe = /"([a-zA-Z0-9_.\-]+)"\s*:/g;
const keys = new Set();
let m;
while ((m = keyRe.exec(enBlock))) keys.add(m[1]);

// 2. Walk src/ collecting code (skip translations.ts, types, tests).
const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".git"]);
const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if ([".ts", ".tsx", ".js", ".jsx"].includes(extname(p)) && p !== TRANSLATIONS) {
      files.push(p);
    }
  }
}
walk(SRC);

const haystack = files.map((f) => readFileSync(f, "utf8")).join("\n");

// 3a. Detect dynamic prefixes from template literals like t(`onboarding.${x}.title`)
//     — collect prefix + suffix pairs and treat any key matching them as used.
const dynamicRe = /t\(`([a-zA-Z0-9_.\-]*)\$\{[^}]+\}([a-zA-Z0-9_.\-]*)`\)/g;
const dynamicPatterns = [];
let dm;
while ((dm = dynamicRe.exec(haystack))) {
  dynamicPatterns.push({ prefix: dm[1], suffix: dm[2] });
}

// 3b. Find unused keys (key must appear as a quoted literal or match a dynamic pattern).
const unused = [];
for (const k of keys) {
  const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`["'\`]${escaped}["'\`]`);
  if (re.test(haystack)) continue;
  const dynMatch = dynamicPatterns.some(
    (p) => k.startsWith(p.prefix) && k.endsWith(p.suffix) && k.length > p.prefix.length + p.suffix.length,
  );
  if (dynMatch) continue;
  unused.push(k);
}

console.log(`\ni18n key scan`);
console.log(`  total keys: ${keys.size}`);
console.log(`  used:       ${keys.size - unused.length}`);
console.log(`  unused:     ${unused.length}`);

if (unused.length) {
  console.log(`\nUnused keys:`);
  for (const k of unused.sort()) console.log(`  - ${k}`);
  if (STRICT) {
    console.error(`\n[strict] Failing build: remove unused keys or pass --no-strict.`);
    process.exit(1);
  }
}
process.exit(0);
