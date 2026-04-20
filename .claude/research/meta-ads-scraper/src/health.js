class SessionDeadError extends Error {
    constructor(reason, detail = null) {
        super(`session dead: ${reason}`);
        this.name = 'SessionDeadError';
        this.reason = reason;
        this.detail = detail;
    }
}

const CHALLENGE_URL_PATTERNS = [
    /\/checkpoint\b/i,
    /\/login\b/i,
    /\/security\/checkpoint/i,
    /\/confirmemail/i,
];

const CHALLENGE_TEXT_PATTERNS = [
    /security check/i,
    /unusual activity/i,
    /please verify/i,
    /confirm your identity/i,
    /you look suspicious/i,
];

/**
 * Pure: returns a reason string if the URL indicates a dead session,
 * otherwise null.
 */
function checkUrl(url) {
    if (!url || typeof url !== 'string') return null;
    for (const re of CHALLENGE_URL_PATTERNS) {
        if (re.test(url)) return `url_match:${re.source}`;
    }
    return null;
}

/**
 * Pure: returns a reason string if the visible text indicates a
 * challenge page, otherwise null.
 */
function checkText(text) {
    if (!text || typeof text !== 'string') return null;
    for (const re of CHALLENGE_TEXT_PATTERNS) {
        if (re.test(text)) return `text_match:${re.source}`;
    }
    return null;
}

class HealthMonitor {
    constructor({ onDead } = {}) {
        this.onDead = onDead;
    }

    /**
     * Inspect a live Playwright page. Throws SessionDeadError on
     * trouble so the caller (crawler requestHandler) can let Crawlee
     * retry the request with a fresh session.
     */
    async check(page) {
        const url = page.url();
        const urlReason = checkUrl(url);
        if (urlReason) {
            this.onDead?.(urlReason);
            throw new SessionDeadError(urlReason, { url });
        }

        try {
            const info = await page.evaluate(() => ({
                title: document.title || '',
                bodyText: (document.body?.innerText || '').slice(0, 2000),
                bodyChildren: document.body?.children?.length ?? 0,
            }));
            const textReason = checkText(info.title) || checkText(info.bodyText);
            if (textReason) {
                this.onDead?.(textReason);
                throw new SessionDeadError(textReason, { url, title: info.title });
            }
            if (info.bodyChildren === 0) {
                this.onDead?.('empty_body');
                throw new SessionDeadError('empty_body', { url });
            }
        } catch (err) {
            if (err instanceof SessionDeadError) throw err;
            // page.evaluate can fail transiently (navigation in flight,
            // page closed). Treat those as non-fatal — the loop will
            // retry on next iteration.
        }
    }
}

module.exports = { HealthMonitor, SessionDeadError, checkUrl, checkText };
