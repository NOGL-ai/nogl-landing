#!/usr/bin/env node
/**
 * Phase 2: @heroicons/react → @untitledui/icons
 *
 * Handles all three heroicons sub-packages:
 *   @heroicons/react/24/solid
 *   @heroicons/react/24/outline
 *   @heroicons/react/16/solid
 *
 * Algorithm (idempotent):
 *   1. Find all TS/TSX files in src/ that import from @heroicons/react.
 *   2. For each import, map the heroicon name to a UUI equivalent.
 *   3. Since UUI names differ from heroicons names, always use an alias so JSX is untouched.
 *   4. Merge new UUI imports into any existing @untitledui/icons import, or add one.
 *   5. Print unmapped icons at the end for manual triage.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '../..');

// Heroicons icon name → UUI export name
// Heroicons icons end with 'Icon' suffix (e.g. ChevronDownIcon).
// UUI icons do NOT use 'Icon' suffix, so aliases are always generated.
const mapping = {
  // Arrows
  ArrowDownIcon: 'ArrowDown',
  ArrowLeftIcon: 'ArrowLeft',
  ArrowRightIcon: 'ArrowRight',
  ArrowTopRightOnSquareIcon: 'LinkExternal01',
  ArrowUpIcon: 'ArrowUp',
  ArrowUpRightIcon: 'ArrowUpRight',
  // Chevrons
  ChevronDownIcon: 'ChevronDown',
  ChevronLeftIcon: 'ChevronLeft',
  ChevronRightIcon: 'ChevronRight',
  ChevronUpIcon: 'ChevronUp',
  // UI / semantic
  Bars3Icon: 'Menu01',
  BellIcon: 'Bell01',
  CheckBadgeIcon: 'Award01',
  CheckCircleIcon: 'CheckCircle',
  DocumentTextIcon: 'File01',
  ExclamationCircleIcon: 'AlertCircle',
  ExclamationTriangleIcon: 'AlertTriangle',
  EyeIcon: 'Eye',
  GlobeAltIcon: 'Globe02',
  InformationCircleIcon: 'InfoCircle',
  MinusIcon: 'Minus',
  MoonIcon: 'Moon01',
  PlusIcon: 'Plus',
  StarIcon: 'Star01',
  SunIcon: 'Sun',
  XCircleIcon: 'XCircle',
  XMarkIcon: 'X',
  // Currency
  BanknotesIcon: 'CurrencyDollar',
  CurrencyDollarIcon: 'CurrencyDollar',
  CurrencyEuroIcon: 'CurrencyEuro',
  CurrencyPoundIcon: 'CurrencyPound',
  CurrencyRupeeIcon: 'CurrencyRupee',
  // CurrencyBangladeshiIcon has no UUI equivalent — left in heroicons
};

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

// Matches ANY @heroicons/react sub-package import block
const heroRe = /import\s*\{([^}]+)\}\s*from\s*['"]@heroicons\/react\/[^'"]+['"];?[ \t]*\n?/gms;
const uuiRe = /import\s*\{([^}]+)\}\s*from\s*['"]@untitledui\/icons['"];?[ \t]*\n?/;

for (const file of walk(join(root, 'src'))) {
  let src = readFileSync(file, 'utf-8');
  if (!src.includes('@heroicons/react')) continue;

  const heroMatches = [...src.matchAll(heroRe)];
  if (!heroMatches.length) continue;

  const toUui = new Map(); // localName -> import spec string
  const toKeep = [];       // raw specifiers with no UUI equivalent

  for (const m of heroMatches) {
    for (const raw of m[1]
      .split(',')
      .map(s => s.trim().replace(/\s+/g, ' '))
      .filter(s => Boolean(s) && !s.startsWith('//'))
    ) {
      const parts = raw.split(/\s+/);
      const exportedName = parts[0];
      if (!exportedName || !/^\w/.test(exportedName)) continue;
      const localName = parts[2] ?? parts[0];
      const uuiName = mapping[exportedName];

      if (uuiName == null) {
        unmapped.add(exportedName);
        toKeep.push(raw);
      } else {
        // Always alias since heroicons use 'Icon' suffix and UUI don't
        const spec = uuiName === localName ? uuiName : `${uuiName} as ${localName}`;
        toUui.set(localName, spec);
      }
    }
  }

  // Remove all heroicons import blocks
  src = src.replace(heroRe, '');

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

  // Re-add unmapped heroicons imports as a single outline import
  if (toKeep.length > 0) {
    const fallbackImport = `import { ${toKeep.join(', ')} } from '@heroicons/react/24/outline';`;
    src = insertAfterDirective(src, fallbackImport);
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

console.log(`\n✅ Phase 2 complete — updated ${changedCount} file(s)`);

if (unmapped.size > 0) {
  console.log('\n⚠️  Unmapped heroicons (left in @heroicons/react). Add to the mapping in this script and re-run:');
  [...unmapped].sort().forEach(n => console.log(`  - ${n}`));
} else {
  console.log('✅ All heroicons were mapped — no leftovers');
}
