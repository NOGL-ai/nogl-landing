#!/usr/bin/env node
/**
 * Phase 4: @/components/ui/button → @/components/base/buttons/button
 *
 * Rewrites:
 *   - Import path
 *   - variant="x" → color="y"  (static string props only)
 *   - variant={'x'} → color={'y'}
 *
 * Flags (does NOT rewrite):
 *   - variant={someVariable}   — dynamic variant, printed for manual fix
 *   - asChild                  — not supported in base button, printed for manual fix
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '../..');

const VARIANT_MAP = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  ghost: 'tertiary',
  outline: 'secondary',
  destructive: 'primary-destructive',
};

const OLD_IMPORT = /(['"])@\/components\/ui\/button\1/;
const NEW_IMPORT = `'@/components/base/buttons/button'`;

// Matches: variant="primary" or variant={'primary'} or variant={"primary"}
const STATIC_VARIANT_RE = /\bvariant=(?:"([^"]+)"|'([^']+)'|\{(?:"([^"]+)"|'([^']+)')\})/g;
// Dynamic variant (variable expression)
const DYNAMIC_VARIANT_RE = /\bvariant=\{(?!['"]).+?\}/g;
// asChild usage
const ASCHILD_RE = /\basChild\b/;

const needsManual = [];
let changed = 0;

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

for (const file of walk(join(root, 'src'))) {
  let src = readFileSync(file, 'utf-8');
  if (!OLD_IMPORT.test(src)) continue;

  const rel = file.replace(root, '').replace(/^[/\\]/, '');
  const flags = [];

  // Replace import path
  src = src.replace(
    /import\s*(\{[^}]+\})\s*from\s*(['"])@\/components\/ui\/button\2/,
    (_, named) => `import ${named} from ${NEW_IMPORT}`
  );

  // Flag dynamic variant
  if (DYNAMIC_VARIANT_RE.test(src)) {
    flags.push('dynamic variant={expr} — map manually');
    DYNAMIC_VARIANT_RE.lastIndex = 0;
  }

  // Flag asChild
  if (ASCHILD_RE.test(src)) {
    flags.push('asChild — replace with <a href> or Link wrapping');
  }

  // Replace static variants
  src = src.replace(STATIC_VARIANT_RE, (match, d1, d2, d3, d4) => {
    const v = d1 ?? d2 ?? d3 ?? d4;
    const mapped = VARIANT_MAP[v];
    if (!mapped) {
      flags.push(`unknown variant="${v}" — check manually`);
      return match;
    }
    // Use same quote style as original
    if (match.startsWith('variant="') || match.startsWith("variant='")) {
      return `color="${mapped}"`;
    }
    return `color={"${mapped}"}`;
  });

  const orig = readFileSync(file, 'utf-8');
  if (src !== orig) {
    writeFileSync(file, src);
    console.log(`✓  ${rel}`);
    changed++;
  }

  if (flags.length) {
    needsManual.push({ file: rel, flags });
  }
}

console.log(`\n✅ Phase 4 complete — updated ${changed} file(s)`);

if (needsManual.length) {
  console.log('\n⚠️  Files requiring manual follow-up:');
  for (const { file, flags } of needsManual) {
    console.log(`\n  ${file}`);
    flags.forEach(f => console.log(`    • ${f}`));
  }
}
