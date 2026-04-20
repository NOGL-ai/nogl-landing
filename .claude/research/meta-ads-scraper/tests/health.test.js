const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
    checkUrl,
    checkText,
    SessionDeadError,
    HealthMonitor,
} = require('../src/health');

test('checkUrl flags /checkpoint', () => {
    assert.ok(checkUrl('https://www.facebook.com/checkpoint/?next=%2Fads%2Flibrary'));
});

test('checkUrl flags /login and /security/checkpoint', () => {
    assert.ok(checkUrl('https://www.facebook.com/login/?next=foo'));
    assert.ok(checkUrl('https://www.facebook.com/security/checkpoint/'));
});

test('checkUrl returns null for healthy URLs', () => {
    assert.equal(checkUrl('https://www.facebook.com/ads/library/?q=nike'), null);
    assert.equal(checkUrl(null), null);
    assert.equal(checkUrl(''), null);
});

test('checkText flags challenge phrases case-insensitively', () => {
    assert.ok(checkText('We noticed some Unusual Activity on your account'));
    assert.ok(checkText('Security check required'));
    assert.ok(checkText('Please verify it is you'));
});

test('checkText returns null for benign copy', () => {
    assert.equal(checkText('Welcome to the Ad Library'), null);
    assert.equal(checkText(''), null);
    assert.equal(checkText(null), null);
});

test('HealthMonitor.check throws SessionDeadError on checkpoint URL', async () => {
    const fakePage = {
        url: () => 'https://www.facebook.com/checkpoint/',
        evaluate: async () => ({ title: 'x', bodyText: '', bodyChildren: 1 }),
    };
    const monitor = new HealthMonitor();
    await assert.rejects(
        () => monitor.check(fakePage),
        (err) => err instanceof SessionDeadError && err.reason.startsWith('url_match:'),
    );
});

test('HealthMonitor.check passes silently on healthy page', async () => {
    const fakePage = {
        url: () => 'https://www.facebook.com/ads/library/',
        evaluate: async () => ({
            title: 'Ad Library',
            bodyText: 'Nike ads and things',
            bodyChildren: 8,
        }),
    };
    await new HealthMonitor().check(fakePage);
});

test('HealthMonitor.check flags empty body', async () => {
    const fakePage = {
        url: () => 'https://www.facebook.com/ads/library/',
        evaluate: async () => ({ title: '', bodyText: '', bodyChildren: 0 }),
    };
    await assert.rejects(
        () => new HealthMonitor().check(fakePage),
        (err) => err instanceof SessionDeadError && err.reason === 'empty_body',
    );
});

test('HealthMonitor.check invokes onDead callback with reason', async () => {
    const reasons = [];
    const monitor = new HealthMonitor({ onDead: (r) => reasons.push(r) });
    const fakePage = {
        url: () => 'https://www.facebook.com/checkpoint/',
        evaluate: async () => ({ title: '', bodyText: '', bodyChildren: 1 }),
    };
    await assert.rejects(() => monitor.check(fakePage));
    assert.equal(reasons.length, 1);
    assert.match(reasons[0], /^url_match:/);
});
