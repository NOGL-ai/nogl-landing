const { test } = require('node:test');
const assert = require('node:assert/strict');

const { DataProcessor } = require('../utils/helpers');

test('fromOfficialApi normalizes a complete row', () => {
    const row = {
        id: '123',
        page_id: '9',
        page_name: 'Nike',
        ad_creative_bodies: ['Just do it', 'second body'],
        ad_delivery_start_time: '2026-01-01',
        ad_delivery_stop_time: '2026-01-31',
        spend: { lower_bound: '100', upper_bound: '500' },
        impressions: { lower_bound: '1000', upper_bound: '5000' },
        currency: 'USD',
        target_ages: [18, 65],
        target_gender: 'All',
        target_locations: [{ name: 'United States' }],
        publisher_platforms: ['facebook', 'instagram'],
        ad_snapshot_url: 'https://example/ad/123',
    };
    const out = DataProcessor.fromOfficialApi(row);
    assert.equal(out.adId, '123');
    assert.equal(out.pageName, 'Nike');
    assert.equal(out.adContent, 'Just do it');
    assert.equal(out.spend.min, 100);
    assert.equal(out.spend.max, 500);
    assert.equal(out.spend.currency, 'USD');
    assert.equal(out.impressions.min, 1000);
    assert.equal(out.impressions.max, 5000);
    assert.equal(out.targeting.ageMin, 18);
    assert.equal(out.targeting.ageMax, 65);
    assert.equal(out.source, 'official_api');
    assert.deepEqual(out.platforms, ['facebook', 'instagram']);
});

test('fromOfficialApi handles missing fields without throwing', () => {
    const out = DataProcessor.fromOfficialApi({ id: 'x' });
    assert.equal(out.adId, 'x');
    assert.equal(out.spend.min, null);
    assert.equal(out.impressions.max, null);
    assert.deepEqual(out.platforms, []);
    assert.equal(out.source, 'official_api');
});

test('fromOfficialApi returns null for non-objects', () => {
    assert.equal(DataProcessor.fromOfficialApi(null), null);
    assert.equal(DataProcessor.fromOfficialApi('nope'), null);
    assert.equal(DataProcessor.fromOfficialApi(undefined), null);
});
