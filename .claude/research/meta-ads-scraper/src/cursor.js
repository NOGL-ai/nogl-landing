/**
 * Pure helpers for extracting pagination state out of Meta Ad Library
 * GraphQL response bodies. The schema path changes periodically, so we
 * walk a set of known locations and return a normalized shape.
 */

const SEARCH_PATHS = [
    ['data', 'ad_library_search'],
    ['data', 'adLibrarySearch'],
    ['data', 'search_results'],
    ['data', 'results'],
];

function getPath(obj, segments) {
    let cur = obj;
    for (const s of segments) {
        if (cur == null || typeof cur !== 'object') return undefined;
        cur = cur[s];
    }
    return cur;
}

/**
 * Extract { hasNextPage, endCursor, edgeCount } from a GraphQL body.
 * Returns nulls if not found — callers should treat that as "unknown".
 */
function extractPageInfo(body) {
    if (!body || typeof body !== 'object') {
        return { hasNextPage: null, endCursor: null, edgeCount: 0 };
    }
    for (const p of SEARCH_PATHS) {
        const container = getPath(body, p);
        if (!container) continue;
        const pageInfo = container.page_info || container.pageInfo;
        const edges = container.edges || [];
        if (pageInfo) {
            return {
                hasNextPage: pageInfo.has_next_page ?? pageInfo.hasNextPage ?? null,
                endCursor: pageInfo.end_cursor ?? pageInfo.endCursor ?? null,
                edgeCount: Array.isArray(edges) ? edges.length : 0,
            };
        }
        if (Array.isArray(edges) && edges.length) {
            return { hasNextPage: null, endCursor: null, edgeCount: edges.length };
        }
    }
    return { hasNextPage: null, endCursor: null, edgeCount: 0 };
}

module.exports = { extractPageInfo };
