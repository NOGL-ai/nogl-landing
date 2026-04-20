/**
 * Flesch-Reading-Ease score for German (Amstad formula).
 *
 *   FRE_de = 180 − ASL − (58.5 × ASW)
 *
 * where ASL = avg sentence length (words/sentence),
 *       ASW = avg syllables per word.
 *
 * Higher = easier. Reference bands (Amstad 1978):
 *   90–100  very easy, 80–90 easy, 70–80 fairly easy, 60–70 standard,
 *   50–60 fairly difficult, 30–50 difficult, 0–30 very difficult.
 */

const VOWELS = /[aeiouäöüyAEIOUÄÖÜY]/;
const SENTENCE_BREAK = /[.!?]+/;

function countSyllablesDe(word: string): number {
	const w = word.toLowerCase().replace(/[^a-zäöüß]/g, "");
	if (!w) return 0;

	// Collapse common diphthongs / digraphs.
	const reduced = w
		.replace(/[aeiouäöü]{2,}/g, "a") // au, ei, ie, eu, äu → single vowel group
		.replace(/e$/, ""); // drop silent trailing e

	let count = 0;
	let prevVowel = false;
	for (const ch of reduced) {
		const isVowel = VOWELS.test(ch);
		if (isVowel && !prevVowel) count++;
		prevVowel = isVowel;
	}
	return Math.max(1, count);
}

export type FleschDeResult = {
	score: number;
	words: number;
	sentences: number;
	syllables: number;
	asl: number;
	asw: number;
	band:
		| "very_easy"
		| "easy"
		| "fairly_easy"
		| "standard"
		| "fairly_difficult"
		| "difficult"
		| "very_difficult";
};

function bandFor(score: number): FleschDeResult["band"] {
	if (score >= 90) return "very_easy";
	if (score >= 80) return "easy";
	if (score >= 70) return "fairly_easy";
	if (score >= 60) return "standard";
	if (score >= 50) return "fairly_difficult";
	if (score >= 30) return "difficult";
	return "very_difficult";
}

export function fleschDe(text: string): FleschDeResult {
	const clean = text.replace(/\s+/g, " ").trim();
	if (!clean) {
		return { score: 0, words: 0, sentences: 0, syllables: 0, asl: 0, asw: 0, band: "very_difficult" };
	}

	const sentences = Math.max(
		1,
		clean.split(SENTENCE_BREAK).filter((s) => s.trim().length > 0).length,
	);
	const words = clean.split(/\s+/).filter(Boolean);
	const syllables = words.reduce((sum, w) => sum + countSyllablesDe(w), 0);

	const asl = words.length / sentences;
	const asw = syllables / Math.max(1, words.length);
	const score = Math.max(0, Math.min(100, 180 - asl - 58.5 * asw));

	return {
		score: Math.round(score * 10) / 10,
		words: words.length,
		sentences,
		syllables,
		asl: Math.round(asl * 100) / 100,
		asw: Math.round(asw * 100) / 100,
		band: bandFor(score),
	};
}
