import { parseDiscount } from "@/lib/email/parse-discount";

describe("parseDiscount", () => {
	it("matches '20% Rabatt'", () => {
		const d = parseDiscount("Sichere dir jetzt 20% Rabatt auf Kameras");
		expect(d?.kind).toBe("percent");
		expect(d?.value).toBe(20);
	});

	it("matches '20 Prozent Nachlass'", () => {
		const d = parseDiscount("Bis zu 20 Prozent Nachlass für kurze Zeit");
		expect(d?.kind).toBe("percent");
		expect(d?.value).toBe(20);
	});

	it("matches '-15% off'", () => {
		const d = parseDiscount("Deal of the week: -15% off select lenses");
		expect(d?.kind).toBe("percent");
		expect(d?.value).toBe(15);
	});

	it("returns null when no discount wording", () => {
		const d = parseDiscount("New products in stock this week");
		expect(d).toBeNull();
	});

	it("ignores false-positive '20% sulfur-free paper'", () => {
		// No Rabatt/off/sale/reduziert word near the %
		const d = parseDiscount("Our paper is now 20% sulfur-free and archival grade");
		expect(d).toBeNull();
	});

	it("extracts euro absolute discount", () => {
		const d = parseDiscount("Spare 50€ auf ausgewählte Objektive");
		expect(d).not.toBeNull();
	});
});
