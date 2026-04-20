/**
 * Per-domain cookie-consent button selectors, falling back to a generic dictionary.
 * Keys are bare-domain matches (no scheme, no www).
 */
export const COOKIE_CONSENT_SELECTORS: Record<string, string[]> = {
	"foto-erhardt.de": ['#cookie-accept', 'button[data-accept="all"]'],
	"fotokoch.de": ['button[data-testid="uc-accept-all-button"]'],
	"foto-leistenschneider.de": ['button.cookie-accept-all'],
	"kamera-express.de": ['.cookie-consent__accept'],
	"teltec.de": ['#onetrust-accept-btn-handler'],
	"calumetphoto.de": ['#onetrust-accept-btn-handler'],
};

export const GENERIC_ACCEPT_SELECTORS = [
	'#onetrust-accept-btn-handler',
	'[id*="accept-all" i]',
	'[class*="accept-all" i]',
	'button[aria-label*="Accept" i]',
	'button[aria-label*="Zustimmen" i]',
	'button[aria-label*="Alle akzeptieren" i]',
	'button:has-text("Accept all")',
	'button:has-text("Alle akzeptieren")',
];

export function selectorsFor(url: string): string[] {
	try {
		const { hostname } = new URL(url);
		const bare = hostname.replace(/^www\./, "");
		const specific = COOKIE_CONSENT_SELECTORS[bare] ?? [];
		return [...specific, ...GENERIC_ACCEPT_SELECTORS];
	} catch {
		return GENERIC_ACCEPT_SELECTORS;
	}
}
