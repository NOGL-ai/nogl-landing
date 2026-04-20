/**
 * German-aware discount extractor for marketing emails.
 *
 * Designed to match "20% off", "20 % Rabatt", "20 Prozent Rabatt", "-20€",
 * "Spare 20 %", while rejecting fragments like "20% sulfur-free paper" that
 * do not express a price reduction.
 */

const PERCENT_WITH_DISCOUNT_WORD = /(-?\d{1,3})\s*(?:%|prozent|pct)\s*(?:off|rabatt|rabat|reduziert|sparen|spar|nachlass|ersparnis|sale|aus|on)\b/i;

// Also match "Rabatt/Spare/Reduziert … 20%" (discount word before percent)
const DISCOUNT_WORD_WITH_PERCENT = /\b(?:rabatt|spare?|spart|reduziert|nachlass|ersparnis|sale|sparen|save|off|deal)\b[^\d%]{0,20}(-?\d{1,3})\s*(?:%|prozent|pct)\b/i;

// Absolute € discount ("-20€", "20 € Rabatt", "spare 20€")
const ABSOLUTE_EURO_DISCOUNT = /(?:-|\b(?:rabatt|spare?|sparen|save|off|sale|reduziert|nachlass|ersparnis)\b[^\d€]{0,20})(\d{1,4})\s*€/i;

export type DiscountMatch = {
	kind: "percent" | "absolute";
	value: number;
	currency?: "EUR";
	snippet: string;
};

export function parseDiscount(text: string | null | undefined): DiscountMatch | null {
	if (!text) return null;
	const normalized = text.replace(/\s+/g, " ");

	const pct1 = normalized.match(PERCENT_WITH_DISCOUNT_WORD);
	if (pct1) {
		const value = Math.abs(parseInt(pct1[1], 10));
		if (value > 0 && value <= 100) {
			return { kind: "percent", value, snippet: pct1[0] };
		}
	}

	const pct2 = normalized.match(DISCOUNT_WORD_WITH_PERCENT);
	if (pct2) {
		const value = Math.abs(parseInt(pct2[1], 10));
		if (value > 0 && value <= 100) {
			return { kind: "percent", value, snippet: pct2[0] };
		}
	}

	const abs = normalized.match(ABSOLUTE_EURO_DISCOUNT);
	if (abs) {
		const value = parseInt(abs[1], 10);
		if (value > 0) {
			return { kind: "absolute", value, currency: "EUR", snippet: abs[0] };
		}
	}

	return null;
}

export function hasDiscount(text: string | null | undefined): boolean {
	return parseDiscount(text) !== null;
}
