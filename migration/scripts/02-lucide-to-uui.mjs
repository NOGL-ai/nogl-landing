#!/usr/bin/env node
/**
 * Phase 3: lucide-react → @untitledui/icons
 *
 * Algorithm (idempotent):
 *   1. Find all TS/TSX files in src/ that import from lucide-react.
 *   2. For each import block, split imports into mapped (→ UUI) and unmapped (stay in lucide).
 *   3. When the UUI export name differs from the local name, use an alias so JSX is untouched.
 *   4. Merge new UUI imports into any existing @untitledui/icons import, or add one.
 *   5. Re-add unmapped icons as a trimmed lucide import.
 *   6. Print unmapped icons at the end for manual triage.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '../..');
const mapping = JSON.parse(readFileSync(join(__dir, '../mappings/lucide.json'), 'utf-8'));

const unmapped = new Set();
let changedCount = 0;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory() && name !== 'node_modules' && !name.startsWith('.')) {
      out.push(...walk(p));
    } else if (s.isFile() && (extname(name) === '.ts' || extname(name) === '.tsx')) {
      out.push(p);
    }
  }
  return out;
}

function insertAfterDirective(src, importStr) {
  const m = src.match(/^(['"]use (?:client|server)['"];?\n\n?)/);
  if (m) {
    return src.slice(0, m[0].length) + importStr + '\n' + src.slice(m[0].length);
  }
  return importStr + '\n' + src;
}

const lucideRe = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"];?[ \t]*\n?/gms;
const uuiRe = /import\s*\{([^}]+)\}\s*from\s*['"]@untitledui\/icons['"];?[ \t]*\n?/;

for (const file of walk(join(root, 'src'))) {
  let src = readFileSync(file, 'utf-8');
  if (!src.includes('lucide-react')) continue;

  const lucideMatches = [...src.matchAll(lucideRe)];
  if (!lucideMatches.length) continue;

  // Collect mapped vs unmapped
  const toUui = new Map(); // localName -> import spec string
  const toKeep = [];       // raw specifiers to keep in lucide

  for (const m of lucideMatches) {
    for (const raw of m[1]
      .split(',')
      .map(s => s.trim().replace(/\s+/g, ' '))
      .filter(Boolean)
    ) {
      const parts = raw.split(/\s+/);
      const exportedName = parts[0];
      const localName = parts[2] ?? parts[0]; // "Name as Alias" or just "Name"
      const uuiName = mapping[exportedName];

      if (uuiName == null) {
        // undefined (not in map) or null (explicitly unmapped) → keep in lucide
        unmapped.add(exportedName);
        toKeep.push(raw);
      } else {
        const spec = uuiName === localName ? uuiName : `${uuiName} as ${localName}`;
        toUui.set(localName, spec);
      }
    }
  }

  // Remove all lucide import blocks
  src = src.replace(lucideRe, '');

  // Merge UUI imports
  if (toUui.size > 0) {
    const newSpecs = [...toUui.values()];
    const existM = src.match(uuiRe);
    if (existM) {
      const existing = existM[1]
        .split(',')
        .map(s => s.trim().replace(/\s+/g, ' '))
        .filter(Boolean);
      const merged = [...new Set([...existing, ...newSpecs])];
      src = src.replace(uuiRe, `import { ${merged.join(', ')} } from '@untitledui/icons';\n`);
    } else {
      src = insertAfterDirective(src, `import { ${newSpecs.join(', ')} } from '@untitledui/icons';`);
    }
  }

  // Re-add unmapped lucide imports
  if (toKeep.length > 0) {
    const lucideImport = `import { ${toKeep.join(', ')} } from 'lucide-react';`;
    src = insertAfterDirective(src, lucideImport);
  }

  // Clean up excessive blank lines
  src = src.replace(/\n{3,}/g, '\n\n');

  const orig = readFileSync(file, 'utf-8');
  if (src !== orig) {
    writeFileSync(file, src);
    console.log(`✓  ${file.replace(root + '/', '').replace(root.replace(/\//g, '\\') + '\\', '')}`);
    changedCount++;
  }
}

console.log(`\n✅ Phase 3 complete — updated ${changedCount} file(s)`);

if (unmapped.size > 0) {
  console.log('\n⚠️  Unmapped icons (left in lucide-react). Add to migration/mappings/lucide.json and re-run:');
  [...unmapped].sort().forEach(n => console.log(`  - ${n}`));
} else {
  console.log('✅ All lucide icons were mapped — no leftovers');
}
