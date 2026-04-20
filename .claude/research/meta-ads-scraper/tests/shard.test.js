const { test } = require('node:test');
const assert = require('node:assert/strict');

const { applyShard } = require('../src/shard');

test('no shard means everything is in', () => {
    for (const k of ['a', 'b', 'c', '1', '2']) {
        assert.equal(applyShard(null, k), true);
        assert.equal(applyShard(undefined, k), true);
        assert.equal(applyShard({ index: 0, total: 1 }, k), true);
    }
});

test('shard partitioning is stable and disjoint', () => {
    const total = 4;
    const buckets = [[], [], [], []];
    for (let i = 0; i < 1000; i++) {
        const key = `ad_${i}`;
        let inCount = 0;
        for (let idx = 0; idx < total; idx++) {
            if (applyShard({ index: idx, total }, key)) {
                buckets[idx].push(key);
                inCount += 1;
            }
        }
        assert.equal(inCount, 1, `key ${key} landed in ${inCount} shards; must be exactly 1`);
    }
    // Every shard should have roughly 25% (allow 15..35% for variance).
    for (const b of buckets) {
        assert.ok(b.length > 150 && b.length < 350, `bucket size ${b.length} outside 150..350`);
    }
});

test('null key is kept (fail-open)', () => {
    assert.equal(applyShard({ index: 0, total: 4 }, null), true);
});

test('applyShard is deterministic', () => {
    const shard = { index: 2, total: 7 };
    assert.equal(applyShard(shard, 'ad_42'), applyShard(shard, 'ad_42'));
});
