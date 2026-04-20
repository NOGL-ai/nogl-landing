const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const DEFAULT_MAX_BYTES = 500 * 1024 * 1024; // 500 MB

function safeKey(input) {
    return crypto.createHash('sha1').update(String(input)).digest('hex').slice(0, 16);
}

class RawCache {
    constructor({ dir = 'storage/raw', maxBytes = DEFAULT_MAX_BYTES } = {}) {
        this.dir = dir;
        this.maxBytes = maxBytes;
        this.enabled = true;
        try {
            fs.mkdirSync(dir, { recursive: true });
        } catch (e) {
            this.enabled = false;
            return;
        }
        this._index = new Map();   // key -> { size, atime }
        this._totalBytes = 0;
        this._bootstrap();
    }

    _bootstrap() {
        try {
            const files = fs.readdirSync(this.dir).filter(f => f.endsWith('.json.gz'));
            const entries = files.map(f => {
                const stat = fs.statSync(path.join(this.dir, f));
                return { key: f.replace(/\.json\.gz$/, ''), size: stat.size, atime: stat.mtimeMs };
            });
            entries.sort((a, b) => a.atime - b.atime);
            for (const e of entries) {
                this._index.set(e.key, { size: e.size, atime: e.atime });
                this._totalBytes += e.size;
            }
            this._evictIfNeeded();
        } catch (e) {
            // Non-fatal; cache is best-effort.
        }
    }

    _pathFor(key) {
        return path.join(this.dir, `${key}.json.gz`);
    }

    _evictIfNeeded() {
        if (this._totalBytes <= this.maxBytes) return;
        const ordered = [...this._index.entries()].sort((a, b) => a[1].atime - b[1].atime);
        for (const [key, meta] of ordered) {
            if (this._totalBytes <= this.maxBytes) break;
            try {
                fs.unlinkSync(this._pathFor(key));
                this._totalBytes -= meta.size;
                this._index.delete(key);
            } catch (_) {
                // If unlink fails, stop — we'll try again next put.
                break;
            }
        }
    }

    /** Store a payload (Buffer or string). Returns the cache key. */
    put(input, payload) {
        if (!this.enabled) return null;
        const key = safeKey(input);
        const buf = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
        const gz = zlib.gzipSync(buf);
        try {
            fs.writeFileSync(this._pathFor(key), gz);
        } catch (_) {
            return null;
        }
        const existing = this._index.get(key);
        if (existing) this._totalBytes -= existing.size;
        this._index.set(key, { size: gz.length, atime: Date.now() });
        this._totalBytes += gz.length;
        this._evictIfNeeded();
        return key;
    }

    /** Retrieve a payload by the raw input (rehashed) or by the cache key. */
    get(inputOrKey) {
        if (!this.enabled) return null;
        const key = inputOrKey && inputOrKey.length === 16 && /^[0-9a-f]+$/.test(inputOrKey)
            ? inputOrKey
            : safeKey(inputOrKey);
        if (!this._index.has(key)) return null;
        try {
            const gz = fs.readFileSync(this._pathFor(key));
            return zlib.gunzipSync(gz);
        } catch (_) {
            return null;
        }
    }

    stats() {
        return {
            enabled: this.enabled,
            entries: this._index ? this._index.size : 0,
            bytes: this._totalBytes || 0,
            maxBytes: this.maxBytes,
        };
    }
}

module.exports = { RawCache, safeKey };
