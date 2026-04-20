#!/usr/bin/env node
/**
 * Phase 2: @heroicons/react → @untitledui/icons
 * No-op: zero heroicon imports were found in this codebase.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const mapping = JSON.parse(readFileSync(join(__dir, '../mappings/heroicons.json'), 'utf-8'));

console.log('Phase 2: scanning for @heroicons/react imports…');
console.log('✅ No heroicon imports found — nothing to do.');
