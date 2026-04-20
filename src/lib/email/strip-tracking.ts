/**
 * Strip tracking pixels and unsubscribe-tracker URLs from HTML email bodies.
 * Conservative: removes 1x1 images, common tracker query params, and beacon-like <img>.
 */

const TRACKING_PIXEL_IMG = /<img[^>]*(?:width=["']?1["']?|height=["']?1["']?|display:\s*none)[^>]*>/gi;
const BEACON_IMG = /<img[^>]*src=["'][^"']*(?:track|beacon|pixel|open|utm|ctrack)[^"']*["'][^>]*>/gi;

const TRACKER_QUERY_PARAMS = [
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_term",
	"utm_content",
	"mc_cid",
	"mc_eid",
	"_ke",
	"yclid",
	"fbclid",
	"gclid",
	"mkt_tok",
];

export function stripTracking(html: string): string {
	if (!html) return "";
	let out = html;
	out = out.replace(TRACKING_PIXEL_IMG, "");
	out = out.replace(BEACON_IMG, "");
	out = out.replace(/href=["']([^"']+)["']/gi, (match, url: string) => {
		try {
			const u = new URL(url);
			for (const param of TRACKER_QUERY_PARAMS) u.searchParams.delete(param);
			return `href="${u.toString()}"`;
		} catch {
			return match;
		}
	});
	return out;
}
