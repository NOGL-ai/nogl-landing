const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let Database = null;
try {
    Database = require('better-sqlite3');
} catch (_) {
    Database = null;
}

const SCHEMA = `
    CREATE TABLE IF NOT EXISTS seen_ad_ids (
        ad_id       TEXT PRIMARY KEY,
        first_seen  INTEGER NOT NULL,
        source      TEXT
    );
    CREATE TABLE IF NOT EXISTS errors (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id   TEXT NOT NULL,
        stage    TEXT NOT NULL,
        ad_id    TEXT,
        msg      TEXT,
        ts       INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS errors_run_ts ON errors(run_id, ts);
    CREATE TABLE IF NOT EXISTS checkpoints (
        run_id TEXT PRIMARY KEY,
        cursor TEXT,
        ts     INTEGER NOT NULL
    );
`;

class StateStore {
    constructor({ dbPath = 'storage/state.db', runId } = {}) {
        this.runId = runId || crypto.randomUUID();
        this.enabled = Boolean(Database);
        this._memSeen = new Set();

        if (!this.enabled) return;

        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.exec(SCHEMA);

        this._insertSeen = this.db.prepare(
            'INSERT OR IGNORE INTO seen_ad_ids (ad_id, first_seen, source) VALUES (?, ?, ?)'
        );
        this._insertError = this.db.prepare(
            'INSERT INTO errors (run_id, stage, ad_id, msg, ts) VALUES (?, ?, ?, ?, ?)'
        );
        this._upsertCheckpoint = this.db.prepare(
            'INSERT INTO checkpoints (run_id, cursor, ts) VALUES (?, ?, ?) '
                + 'ON CONFLICT(run_id) DO UPDATE SET cursor=excluded.cursor, ts=excluded.ts'
        );
        this._getCheckpoint = this.db.prepare(
            'SELECT cursor FROM checkpoints WHERE run_id = ?'
        );
        this._countSeen = this.db.prepare('SELECT COUNT(*) AS c FROM seen_ad_ids');
        this._countErrors = this.db.prepare('SELECT COUNT(*) AS c FROM errors WHERE run_id = ?');
    }

    /** Returns true iff the ad_id was not already seen. */
    markSeen(adId, source = 'unknown') {
        if (!adId) return false;
        const key = String(adId);
        if (!this.enabled) {
            if (this._memSeen.has(key)) return false;
            this._memSeen.add(key);
            return true;
        }
        const r = this._insertSeen.run(key, Date.now(), source);
        return r.changes > 0;
    }

    logError(stage, msg, adId = null) {
        if (!this.enabled) return;
        try {
            this._insertError.run(
                this.runId,
                String(stage).slice(0, 64),
                adId ? String(adId) : null,
                String(msg ?? '').slice(0, 2000),
                Date.now()
            );
        } catch (_) {
            // Never let error logging throw.
        }
    }

    saveCheckpoint(cursor) {
        if (!this.enabled) return;
        this._upsertCheckpoint.run(this.runId, cursor || null, Date.now());
    }

    loadCheckpoint(runId = this.runId) {
        if (!this.enabled) return null;
        const row = this._getCheckpoint.get(runId);
        return row?.cursor ?? null;
    }

    stats() {
        if (!this.enabled) return { enabled: false, seen: this._memSeen.size, errors: 0 };
        return {
            enabled: true,
            seen: this._countSeen.get().c,
            errors: this._countErrors.get(this.runId).c,
        };
    }

    close() {
        if (this.enabled && this.db) this.db.close();
    }
}

module.exports = { StateStore };
