#!/usr/bin/env node
// 01-heroicons-to-uui.mjs — rewrites @heroicons/react/* imports to @untitledui/icons
// Run from repo root of nogl-landing:  node migration/scripts/01-heroicons-to-uui.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..', 'src');
const MAPPING = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../mappings/heroicons.json'), 'utf8')
);
delete MAPPING._comment;

const misses = new Map(); // name -> Set(files)
const touched = [];

const IMPORT_RE =
  /import\s*\{([^}]+)\}\s*from\s*['"]@heroicons\/react\/(?:16|20|24)\/(?:outline|solid)['"]\s*;?/g;

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
  if (!src.includes('@heroicons/react')) return;

  let changed = false;
  const uuiImports = new Set();

  const next = src.replace(IMPORT_RE, (_m, inside) => {
    const names = inside
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const raw of names) {
      // Handle `Foo as Bar`
      const [origRaw, aliasRaw] = raw.split(/\s+as\s+/).map((s) => s.trim());
      const orig = origRaw.replace(/,$/, '');
      const alias = aliasRaw?.replace(/,$/, '') || null;
      const target = MAPPING[orig];
      if (!target) {
        if (!misses.has(orig)) misses.set(orig, new Set());
        misses.get(orig).add(file);
        // keep the import line by re-emitting — we'll drop it only if all names mapped
        uuiImports.add(`__UNMAPPED__${orig}`);
        continue;
      }
      uuiImports.add(alias ? `${target} as ${alias}` : target);
    }
    changed = true;
    return ''; // remove the original import; we re-emit UUI import below
  });

  if (!changed) return;

  // If any name was unmapped, bail out — user needs to triage.
  const unmapped = [...uuiImports].filter((x) => x.startsWith('__UNMAPPED__'));
  if (unmapped.length) {
    return; // leave file alone, misses map already populated
  }

  // Insert a single @untitledui/icons import at top (or merge into existing one)
  const list = [...uuiImports].sort().join(', ');
  let out = next;
  const existing = /import\s*\{([^}]+)\}\s*from\s*['"]@untitledui\/icons['"]\s*;?/;
  if (existing.test(out)) {
    out = out.replace(existing, (_m, inside) => {
      const merged = new Set(
        inside.split(',').map((s) => s.trim()).filter(Boolean).concat([...uuiImports])
      );
      return `import { ${[...merged].sort().join(', ')} } from "@untitledui/icons";`;
    });
  } else {
    out = `import { ${list} } from "@untitledui/icons";\n` + out;
  }

  // Clean leftover double blank lines from removed imports
  out = out.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(file, out);
  touched.push(file);
}

walk(ROOT);

console.log(`\n✅ Rewrote ${touched.length} file(s).`);
if (misses.size) {
  console.log(`\n⚠️  Unmapped icons (add to migration/mappings/heroicons.json and re-run):\n`);
  for (const [name, files] of [...misses.entries()].sort()) {
    console.log(`  ${name}  (${files.size} file${files.size > 1 ? 's' : ''})`);
  }
  process.exit(1);
}
