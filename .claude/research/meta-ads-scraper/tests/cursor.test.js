const { test } = require('node:test');
const assert = require('node:assert/strict');

const { extractPageInfo } = require('../src/cursor');

test('extractPageInfo reads snake_case page_info under ad_library_search', () => {
    const body = {
        data: {
            ad_library_search: {
                edges: [{ node: { id: 1 } }, { node: { id: 2 } }],
                page_info: { has_next_page: true, end_cursor: 'CURSOR_A' },
            },
        },
    };
    assert.deepEqual(extractPageInfo(body), {
        hasNextPage: true,
        endCursor: 'CURSOR_A',
        edgeCount: 2,
    });
});

test('extractPageInfo reads camelCase pageInfo under adLibrarySearch', () => {
    const body = {
        data: {
            adLibrarySearch: {
                edges: [{ node: { id: 'a' } }],
                pageInfo: { hasNextPage: false, endCursor: null },
            },
        },
    };
    assert.deepEqual(extractPageInfo(body), {
        hasNextPage: false,
        endCursor: null,
        edgeCount: 1,
    });
});

test('extractPageInfo returns edgeCount when page_info is absent', () => {
    const body = { data: { search_results: { edges: [{}, {}, {}] } } };
    const info = extractPageInfo(body);
    assert.equal(info.edgeCount, 3);
    assert.equal(info.hasNextPage, null);
    assert.equal(info.endCursor, null);
});

test('extractPageInfo returns zeros on unknown shape', () => {
    assert.deepEqual(extractPageInfo({}), { hasNextPage: null, endCursor: null, edgeCount: 0 });
    assert.deepEqual(extractPageInfo(null), { hasNextPage: null, endCursor: null, edgeCount: 0 });
    assert.deepEqual(extractPageInfo('nope'), { hasNextPage: null, endCursor: null, edgeCount: 0 });
});
