const DEFAULT_API_VERSION = 'v19.0';

const REGULATED_AD_TYPES = new Set([
    'POLITICAL_AND_ISSUE_ADS',
    'HOUSING_ADS',
    'EMPLOYMENT_ADS',
    'CREDIT_ADS',
]);

const DEFAULT_FIELDS = [
    'id',
    'ad_creation_time',
    'ad_creative_bodies',
    'ad_creative_link_captions',
    'ad_creative_link_descriptions',
    'ad_creative_link_titles',
    'ad_delivery_start_time',
    'ad_delivery_stop_time',
    'ad_snapshot_url',
    'bylines',
    'currency',
    'delivery_by_region',
    'demographic_distribution',
    'estimated_audience_size',
    'impressions',
    'languages',
    'page_id',
    'page_name',
    'publisher_platforms',
    'spend',
    'target_ages',
    'target_gender',
    'target_locations',
];

class OfficialApiClient {
    constructor({
        accessToken,
        apiVersion = DEFAULT_API_VERSION,
        fetchFn,
        logger,
        maxRetries = 4,
        backoffMs = 500,
    } = {}) {
        if (!accessToken) throw new Error('OfficialApiClient requires an accessToken');
        this.accessToken = accessToken;
        this.apiVersion = apiVersion;
        this.fetchFn = fetchFn || globalThis.fetch;
        this.logger = logger || console;
        this.maxRetries = maxRetries;
        this.backoffMs = backoffMs;
        this.baseUrl = `https://graph.facebook.com/${apiVersion}/ads_archive`;
    }

    static canHandle({ accessToken, adType }) {
        if (!accessToken) return false;
        return REGULATED_AD_TYPES.has(String(adType || '').toUpperCase());
    }

    buildParams({
        query,
        country,
        adType,
        cursor,
        extraParams = {},
        limit = 25,
        fields = DEFAULT_FIELDS,
    }) {
        const params = new URLSearchParams();
        params.set('access_token', this.accessToken);
        params.set('ad_type', String(adType).toUpperCase());
        if (query) params.set('search_terms', query);
        if (country && country !== 'ALL') {
            params.set('ad_reached_countries', JSON.stringify([country]));
        }
        params.set('ad_active_status', 'ALL');
        params.set('fields', fields.join(','));
        params.set('limit', String(limit));
        if (cursor) params.set('after', cursor);
        // Passthrough (Salisbury pattern): any field the user adds to
        // extraApiParams is forwarded verbatim, so new Meta fields need
        // no code change.
        for (const [k, v] of Object.entries(extraParams || {})) {
            params.set(k, typeof v === 'string' ? v : JSON.stringify(v));
        }
        return params;
    }

    async request(params, attempt = 0) {
        const url = `${this.baseUrl}?${params.toString()}`;
        let res;
        try {
            res = await this.fetchFn(url);
        } catch (err) {
            if (attempt < this.maxRetries) {
                await sleep(this.backoffMs * (2 ** attempt));
                return this.request(params, attempt + 1);
            }
            throw err;
        }
        if (res.status === 429 || res.status >= 500) {
            if (attempt < this.maxRetries) {
                await sleep(this.backoffMs * (2 ** attempt));
                return this.request(params, attempt + 1);
            }
            const text = await safeText(res);
            throw new Error(`official API ${res.status}: ${text}`);
        }
        if (!res.ok) {
            const text = await safeText(res);
            throw new Error(`official API ${res.status}: ${text}`);
        }
        return res.json();
    }

    /** Async generator yielding one ad row at a time, across all pages. */
    async *iterate(opts) {
        let cursor = opts.cursor || null;
        let safetyPages = 0;
        while (safetyPages < 10_000) {
            safetyPages += 1;
            const params = this.buildParams({ ...opts, cursor });
            const body = await this.request(params);
            const data = Array.isArray(body.data) ? body.data : [];
            for (const row of data) yield row;
            const next = body?.paging?.cursors?.after;
            if (!next || data.length === 0) return;
            if (next === cursor) return; // guard against server loop
            cursor = next;
        }
    }
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function safeText(res) {
    try {
        return (await res.text()).slice(0, 500);
    } catch (_) {
        return '<unreadable>';
    }
}

module.exports = {
    OfficialApiClient,
    REGULATED_AD_TYPES,
    DEFAULT_API_VERSION,
    DEFAULT_FIELDS,
};
