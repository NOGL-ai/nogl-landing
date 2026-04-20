const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { StateStore } = require('../src/state');

function tmpDb() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'state-'));
    return path.join(dir, 'state.db');
}

test('markSeen returns true once then false', () => {
    const s = new StateStore({ dbPath: tmpDb() });
    assert.equal(s.markSeen('ad_1', 'graphql'), true);
    assert.equal(s.markSeen('ad_1', 'graphql'), false);
    assert.equal(s.markSeen('ad_2', 'dom'), true);
    s.close();
});

test('logError does not throw and stats reflect inserted rows', () => {
    const s = new StateStore({ dbPath: tmpDb() });
    s.logError('dom_extract', 'boom', 'ad_42');
    s.logError('graphql_parse', new Error('nope').message, null);
    const stats = s.stats();
    if (stats.enabled) assert.equal(stats.errors, 2);
    s.close();
});

test('checkpoint round-trip', () => {
    const s = new StateStore({ dbPath: tmpDb() });
    assert.equal(s.loadCheckpoint(), null);
    s.saveCheckpoint('cursor_abc');
    if (s.enabled) assert.equal(s.loadCheckpoint(), 'cursor_abc');
    s.saveCheckpoint('cursor_def');
    if (s.enabled) assert.equal(s.loadCheckpoint(), 'cursor_def');
    s.close();
});

test('degrades to in-memory when better-sqlite3 missing', () => {
    // Can't easily simulate missing module, but even with it present the
    // in-memory fallback exposed via _memSeen must work when enabled=false.
    const s = new StateStore({ dbPath: tmpDb() });
    // Force a fresh memory path and verify the same contract:
    s.enabled = false;
    s._memSeen = new Set();
    assert.equal(s.markSeen('x'), true);
    assert.equal(s.markSeen('x'), false);
    s.close();
});
