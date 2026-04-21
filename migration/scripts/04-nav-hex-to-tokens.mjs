#!/usr/bin/env node
// 04-nav-hex-to-tokens.mjs — tokenizes hard-coded hex colors in app-navigation
// Scope: src/components/application/app-navigation/**
// Rewrites bg-[#xxx], hover:bg-[#xxx], text-[#xxx], border-[#xxx], ring-[#xxx],
// stroke-[#xxx], fill-[#xxx] to the UUI token classes defined in
// migration/mappings/nav-colors.json.
//
// Hex matches are CASE-INSENSITIVE but the mapping keys are lowercase.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCOPE = path.resolve(__dirname, '../..', 'src/components/application/app-navigation');
const MAPPING = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../mappings/nav-colors.json'), 'utf8')
);
delete MAPPING._comment;

const PROP_ALIASES = {
  bg: 'bg',
  text: 'text',
  border: 'border',
  ring: 'ring',
  stroke: 'text', // map stroke-[#xxx] to text token (icons inherit currentColor when className text-*)
  fill: 'text',
};

const touched = [];
const misses = new Map(); // hex -> count

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(t|j)sx?$/.test(name)) processFile(p);
  }
}

function processFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  // matches: optional variant: prefix(es) ending in `:`, then prop-[#hex]
  // groups: prefixes (e.g. "dark:hover:"), prop (bg|text|border|...), hex
  const RE = /((?:[a-z-]+:)*)(bg|hover:bg|text|hover:text|border|hover:border|ring|hover:ring|stroke|fill)-\[#([0-9a-fA-F]{3,8})\]/g;

  let changed = false;
  const out = src.replace(RE, (_m, prefixes, propExpr, hex) => {
    const h = hex.toLowerCase();
    // normalize 3-digit shorthand
    const norm = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
    const mapping = MAPPING[norm];
    // split "hover:bg" → hover:, bg
    const hoverMatch = propExpr.match(/^(hover:)?(bg|text|border|ring|stroke|fill)$/);
    const hoverPrefix = hoverMatch?.[1] ?? '';
    const prop = PROP_ALIASES[hoverMatch?.[2]];
    if (!mapping || !mapping[prop]) {
      if (!misses.has(norm)) misses.set(norm, 0);
      misses.set(norm, misses.get(norm) + 1);
      return _m; // leave it
    }
    changed = true;
    return `${prefixes}${hoverPrefix}${mapping[prop]}`;
  });

  if (changed) {
    fs.writeFileSync(file, out);
    touched.push(file);
  }
}

walk(SCOPE);

console.log(`\n✅ Rewrote ${touched.length} file(s).`);
if (misses.size) {
  console.log(`\n⚠️  Unmapped hex values (add to migration/mappings/nav-colors.json):\n`);
  for (const [hex, count] of [...misses.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  #${hex}  (${count} occurrence${count > 1 ? 's' : ''})`);
  }
}
