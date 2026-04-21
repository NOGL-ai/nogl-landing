#!/usr/bin/env node
// 02-lucide-to-uui.mjs — rewrites lucide-react imports to @untitledui/icons
// Handles `import { X, Foo as Bar } from 'lucide-react'`.
// Run from repo root of nogl-landing:  node migration/scripts/02-lucide-to-uui.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..', 'src');
const MAPPING = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../mappings/lucide.json'), 'utf8')
);
delete MAPPING._comment;

const misses = new Map();
const touched = [];

// Matches both single-line and multi-line `import { ... } from 'lucide-react';`
const IMPORT_RE = /import\s*\{([\s\S]*?)\}\s*from\s*['"]lucide-react['"]\s*;?/g;

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
  if (!src.includes('lucide-react')) return;

  let allMapped = true;
  const uuiImports = new Set();

  const matches = [...src.matchAll(IMPORT_RE)];
  if (!matches.length) return;

  for (const m of matches) {
    const names = m[1]
      .split(',')
      .map((s) => s.replace(/\/\/.*/g, '').trim())
      .filter(Boolean);
    for (const raw of names) {
      const [origRaw, aliasRaw] = raw.split(/\s+as\s+/).map((s) => s.trim());
      const orig = origRaw.replace(/,$/, '');
      const alias = aliasRaw?.replace(/,$/, '') || null;
      const target = MAPPING[orig];
      if (!target) {
        allMapped = false;
        if (!misses.has(orig)) misses.set(orig, new Set());
        misses.get(orig).add(file);
        continue;
      }
      // If the UUI name equals the source name, keep alias unnecessary;
      // else emit `Target as Source` so JSX call sites keep working.
      if (target === orig) {
        uuiImports.add(alias ? `${target} as ${alias}` : target);
      } else if (alias) {
        uuiImports.add(`${target} as ${alias}`);
      } else {
        uuiImports.add(`${target} as ${orig}`);
      }
    }
  }

  if (!allMapped) return; // don't touch file until mapping is complete

  // Remove all lucide-react imports
  let out = src.replace(IMPORT_RE, '');

  // Merge into existing @untitledui/icons import if any
  const existing = /import\s*\{([^}]+)\}\s*from\s*['"]@untitledui\/icons['"]\s*;?/;
  if (existing.test(out)) {
    out = out.replace(existing, (_m, inside) => {
      const merged = new Set(
        inside.split(',').map((s) => s.trim()).filter(Boolean).concat([...uuiImports])
      );
      return `import { ${[...merged].sort().join(', ')} } from "@untitledui/icons";`;
    });
  } else {
    out = `import { ${[...uuiImports].sort().join(', ')} } from "@untitledui/icons";\n` + out;
  }

  out = out.replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(file, out);
  touched.push(file);
}

walk(ROOT);

console.log(`\n✅ Rewrote ${touched.length} file(s).`);
if (misses.size) {
  console.log(`\n⚠️  Unmapped lucide icons (add to migration/mappings/lucide.json and re-run):\n`);
  for (const [name, files] of [...misses.entries()].sort()) {
    console.log(`  ${name}  (${files.size} file${files.size > 1 ? 's' : ''})`);
  }
  process.exit(1);
}
