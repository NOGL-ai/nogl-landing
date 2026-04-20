#!/usr/bin/env node
/**
 * Phase 6: Replace raw hex values in app-navigation with CSS variable tokens.
 *
 * Replaces patterns like:
 *   bg-[#0a0d12]       → bg-[--color-gray-950]
 *   text-[#717680]     → text-[--color-gray-500]
 *   border-[#e9eaeb]   → border-[--color-gray-200]
 *   bg-[#252b37]/50    → bg-[--color-gray-800]/50  (opacity preserved)
 *
 * Hex values without a mapping entry are left unchanged.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '../..');

const mapping = JSON.parse(
  readFileSync(join(__dir, '../mappings/nav-colors.json'), 'utf-8')
);

const NAV_DIR = join(root, 'src', 'components', 'application', 'app-navigation');

const skipped = new Set();
let changed = 0;

// Matches [#rrggbb] with optional /opacity suffix, preceded by a Tailwind utility prefix
// e.g., bg-[#0a0d12], text-[#717680]/80, dark:hover:bg-[#252b37]/50
const hexRe = /\[#([0-9a-fA-F]{6})\]/g;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory() && !name.startsWith('.')) {
      out.push(...walk(p));
    } else if (s.isFile() && (extname(name) === '.ts' || extname(name) === '.tsx')) {
      out.push(p);
    }
  }
  return out;
}

for (const file of walk(NAV_DIR)) {
  let src = readFileSync(file, 'utf-8');
  const orig = src;

  src = src.replace(hexRe, (match, hex) => {
    const key = `#${hex.toLowerCase()}`;
    const token = mapping[key];
    if (token) return `[${token}]`;
    skipped.add(`#${hex}`);
    return match;
  });

  if (src !== orig) {
    writeFileSync(file, src);
    const rel = file.replace(root, '').replace(/^[/\\]/, '');
    console.log(`✓  ${rel}`);
    changed++;
  }
}

console.log(`\n✅ Phase 6 complete — updated ${changed} file(s)`);

if (skipped.size > 0) {
  console.log('\n⚠️  Unmapped hex values (left as-is — add to nav-colors.json if needed):');
  [...skipped].sort().forEach(h => console.log(`  - ${h}`));
}
