const crypto = require('crypto');

/**
 * Returns true iff the key belongs to this shard.
 *
 * shard is either null/undefined (no sharding) or
 *   { index: 0..total-1, total: N }.
 * The key is hashed with MD5 and the first 32 bits modulo `total` are
 * compared to `index`. Stable across runs and consistent between the
 * official-API path and the browser path.
 */
function applyShard(shard, key) {
    if (!shard || typeof shard.total !== 'number' || typeof shard.index !== 'number') return true;
    if (shard.total <= 1) return true;
    if (key == null) return true;
    const h = crypto.createHash('md5').update(String(key)).digest();
    return (h.readUInt32BE(0) % shard.total) === shard.index;
}

module.exports = { applyShard };
