const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
    OfficialApiClient,
    REGULATED_AD_TYPES,
} = require('../src/officialApi');

function mockResponse(body, { status = 200 } = {}) {
    return {
        ok: status >= 200 && status < 300,
        status,
        async json() { return body; },
        async text() { return JSON.stringify(body); },
    };
}

test('canHandle returns true only for regulated ad types with a token', () => {
    assert.equal(OfficialApiClient.canHandle({ accessToken: 't', adType: 'POLITICAL_AND_ISSUE_ADS' }), true);
    assert.equal(OfficialApiClient.canHandle({ accessToken: 't', adType: 'housing_ads' }), true);
    assert.equal(OfficialApiClient.canHandle({ accessToken: 't', adType: 'ALL' }), false);
    assert.equal(OfficialApiClient.canHandle({ accessToken: '', adType: 'POLITICAL_AND_ISSUE_ADS' }), false);
    assert.equal(OfficialApiClient.canHandle({ adType: 'POLITICAL_AND_ISSUE_ADS' }), false);
});

test('constructor requires accessToken', () => {
    assert.throws(() => new OfficialApiClient({}));
});

test('buildParams wires access_token, ad_type, search_terms, country array, cursor', () => {
    const c = new OfficialApiClient({ accessToken: 'T', fetchFn: async () => {} });
    const p = c.buildParams({
        query: 'nike',
        country: 'US',
        adType: 'POLITICAL_AND_ISSUE_ADS',
        cursor: 'C1',
    });
    assert.equal(p.get('access_token'), 'T');
    assert.equal(p.get('ad_type'), 'POLITICAL_AND_ISSUE_ADS');
    assert.equal(p.get('search_terms'), 'nike');
    assert.equal(p.get('ad_reached_countries'), '["US"]');
    assert.equal(p.get('ad_active_status'), 'ALL');
    assert.equal(p.get('after'), 'C1');
    assert.ok(p.get('fields').includes('page_name'));
});

test('buildParams drops country when ALL', () => {
    const c = new OfficialApiClient({ accessToken: 'T', fetchFn: async () => {} });
    const p = c.buildParams({ query: 'q', country: 'ALL', adType: 'POLITICAL_AND_ISSUE_ADS' });
    assert.equal(p.get('ad_reached_countries'), null);
});

test('extraParams is forwarded verbatim and can override defaults', () => {
    const c = new OfficialApiClient({ accessToken: 'T', fetchFn: async () => {} });
    const p = c.buildParams({
        query: 'q',
        country: 'US',
        adType: 'POLITICAL_AND_ISSUE_ADS',
        extraParams: { limit: '50', new_meta_field: 'abc' },
    });
    assert.equal(p.get('limit'), '50');
    assert.equal(p.get('new_meta_field'), 'abc');
});

test('request retries on 429 then succeeds', async () => {
    let calls = 0;
    const fetchFn = async () => {
        calls += 1;
        return calls < 3 ? mockResponse({}, { status: 429 }) : mockResponse({ data: [{ id: '1' }] });
    };
    const c = new OfficialApiClient({ accessToken: 'T', fetchFn, backoffMs: 1, maxRetries: 4 });
    const p = c.buildParams({ query: 'q', country: 'US', adType: 'POLITICAL_AND_ISSUE_ADS' });
    const body = await c.request(p);
    assert.equal(body.data[0].id, '1');
    assert.equal(calls, 3);
});

test('request throws after maxRetries on persistent 500', async () => {
    let calls = 0;
    const fetchFn = async () => { calls += 1; return mockResponse({ error: 'boom' }, { status: 500 }); };
    const c = new OfficialApiClient({ accessToken: 'T', fetchFn, backoffMs: 1, maxRetries: 2 });
    const p = c.buildParams({ query: 'q', country: 'US', adType: 'POLITICAL_AND_ISSUE_ADS' });
    await assert.rejects(() => c.request(p), /official API 500/);
    assert.equal(calls, 3); // initial + 2 retries
});

test('iterate yields across two pages then stops on missing cursor', async () => {
    const pages = [
        { data: [{ id: 'a' }, { id: 'b' }], paging: { cursors: { after: 'CURSOR_2' } } },
        { data: [{ id: 'c' }], paging: {} },
    ];
    let i = 0;
    const fetchFn = async () => mockResponse(pages[i++]);
    const c = new OfficialApiClient({ accessToken: 'T', fetchFn, backoffMs: 1 });
    const out = [];
    for await (const row of c.iterate({ query: 'q', country: 'US', adType: 'POLITICAL_AND_ISSUE_ADS' })) {
        out.push(row.id);
    }
    assert.deepEqual(out, ['a', 'b', 'c']);
});

test('iterate stops when server returns empty data', async () => {
    const fetchFn = async () => mockResponse({ data: [], paging: { cursors: { after: 'X' } } });
    const c = new OfficialApiClient({ accessToken: 'T', fetchFn, backoffMs: 1 });
    const out = [];
    for await (const row of c.iterate({ query: 'q', country: 'US', adType: 'POLITICAL_AND_ISSUE_ADS' })) {
        out.push(row);
    }
    assert.deepEqual(out, []);
});

test('REGULATED_AD_TYPES contains the four regulated categories', () => {
    for (const t of ['POLITICAL_AND_ISSUE_ADS', 'HOUSING_ADS', 'EMPLOYMENT_ADS', 'CREDIT_ADS']) {
        assert.ok(REGULATED_AD_TYPES.has(t));
    }
});
