const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { RawCache, safeKey } = require('../src/rawCache');

function tmpDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'rawcache-'));
}

test('put then get round-trips the payload via gzip', () => {
    const dir = tmpDir();
    const c = new RawCache({ dir });
    const body = JSON.stringify({ hello: 'world', edges: Array(50).fill({ x: 1 }) });
    const key = c.put('req-1', body);
    assert.ok(key, 'put should return a key');
    const got = c.get('req-1');
    assert.ok(got, 'get should find the entry');
    assert.equal(got.toString('utf8'), body);
});

test('gzip is actually applied on disk', () => {
    const dir = tmpDir();
    const c = new RawCache({ dir });
    const big = 'x'.repeat(100_000);
    const key = c.put('big', big);
    const onDisk = fs.readFileSync(path.join(dir, `${key}.json.gz`));
    assert.ok(onDisk.length < big.length / 10, 'gzip should compress repetitive data to <10%');
});

test('LRU eviction keeps totalBytes <= maxBytes', () => {
    const dir = tmpDir();
    const c = new RawCache({ dir, maxBytes: 5_000 });
    // Use incompressible per-key payloads so gzip doesn't squash them
    // below the eviction threshold.
    const crypto = require('node:crypto');
    for (let i = 0; i < 20; i++) {
        c.put(`k-${i}`, crypto.randomBytes(2000).toString('base64'));
    }
    const stats = c.stats();
    assert.ok(stats.bytes <= stats.maxBytes, `bytes ${stats.bytes} must stay <= max ${stats.maxBytes}`);
    assert.ok(stats.entries > 0 && stats.entries < 20, 'some entries evicted, some kept');
});

test('safeKey is deterministic and hex', () => {
    const k = safeKey('hello world');
    assert.equal(k.length, 16);
    assert.match(k, /^[0-9a-f]+$/);
    assert.equal(safeKey('hello world'), k);
});

test('get by cache key (16-hex) also works', () => {
    const dir = tmpDir();
    const c = new RawCache({ dir });
    const key = c.put('abc', 'payload');
    const got = c.get(key);
    assert.equal(got.toString('utf8'), 'payload');
});
