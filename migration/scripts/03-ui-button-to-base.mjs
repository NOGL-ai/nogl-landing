#!/usr/bin/env node
// 03-ui-button-to-base.mjs — migrates @/components/ui/button → @/components/base/buttons/button
// Key API delta: `variant` (ui) → `color` (base). Mapping:
//   primary     → primary
//   secondary   → secondary
//   tertiary    → tertiary
//   destructive → primary-destructive
//   ghost       → tertiary
//   outline     → secondary
// `size` is 1:1 (sm|md|lg|xl).
//
// This script is intentionally conservative: it only rewrites files that import
// Button from @/components/ui/button AND whose Button usages we can parse safely
// (no dynamic variant props). Files with dynamic `variant={someVar}` are reported
// for manual review.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..', 'src');

const VARIANT_TO_COLOR = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  destructive: 'primary-destructive',
  ghost: 'tertiary',
  outline: 'secondary',
};

const touched = [];
const needsManual = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = path.join(dir, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(t|j)sx?$/.test(name)) processFile(p);
  }
}

function processFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  if (!/from\s*['"]@\/components\/ui\/button['"]/.test(src)) return;

  // Detect dynamic variant — bail for manual review
  if (/<Button[^>]*\svariant=\{(?!['"])/.test(src)) {
    needsManual.push(file);
    return;
  }

  let out = src;

  // Rewrite import
  out = out.replace(
    /from\s*(['"])@\/components\/ui\/button\1/g,
    'from $1@/components/base/buttons/button$1'
  );

  // Rewrite variant="x" → color="y"
  out = out.replace(/<Button([^>]*?)\svariant=(['"])([a-z-]+)\2/g, (m, pre, q, v) => {
    const color = VARIANT_TO_COLOR[v] ?? v;
    return `<Button${pre} color=${q}${color}${q}`;
  });

  if (out !== src) {
    fs.writeFileSync(file, out);
    touched.push(file);
  }
}

walk(ROOT);

console.log(`\n✅ Rewrote ${touched.length} file(s).`);
if (needsManual.length) {
  console.log(`\n⚠️  ${needsManual.length} file(s) use a dynamic <Button variant={...}> — migrate by hand:\n`);
  needsManual.forEach((f) => console.log('  ' + f));
}
