import { fleschDe } from "@/lib/text/flesch-de";

describe("fleschDe", () => {
	it("returns a zero result for empty input", () => {
		const r = fleschDe("");
		expect(r.score).toBe(0);
		expect(r.words).toBe(0);
		expect(r.band).toBe("very_difficult");
	});

	it("scores a short simple German sentence as easier than a long one", () => {
		const easy = fleschDe("Heute ist ein schöner Tag. Morgen kommt die Post.");
		const hard = fleschDe(
			"Die bauaufsichtsrechtlichen Genehmigungsverfahren sind nach Maßgabe der einschlägigen Verwaltungsvorschriften fristgerecht durchzuführen.",
		);
		expect(easy.score).toBeGreaterThan(hard.score);
		expect(easy.words).toBeGreaterThan(0);
	});

	it("produces bands in the expected order", () => {
		const r = fleschDe("Ich gehe heute ins Kino.");
		expect([
			"very_easy",
			"easy",
			"fairly_easy",
			"standard",
			"fairly_difficult",
			"difficult",
			"very_difficult",
		]).toContain(r.band);
	});
});
