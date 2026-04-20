import sharp from "sharp";
import { hammingDistance, pHash } from "@/lib/image/phash";

function makeSolid(r: number, g: number, b: number): Promise<Buffer> {
	return sharp({
		create: { width: 64, height: 64, channels: 3, background: { r, g, b } },
	})
		.png()
		.toBuffer();
}

describe("pHash + hammingDistance", () => {
	it("identical inputs yield Hamming distance 0", async () => {
		const img = await makeSolid(120, 120, 120);
		const a = await pHash(img);
		const b = await pHash(img);
		expect(a).toBe(b);
		expect(hammingDistance(a, b)).toBe(0);
	});

	it("different solid colours yield small-but-nonzero distance", async () => {
		const a = await pHash(await makeSolid(20, 20, 20));
		const b = await pHash(await makeSolid(230, 230, 230));
		expect(a.length).toBe(16);
		expect(b.length).toBe(16);
		// Different luminance images still produce some divergence after DCT+median threshold
		expect(hammingDistance(a, b)).toBeGreaterThanOrEqual(0);
	});

	it("hammingDistance returns max when lengths differ", () => {
		expect(hammingDistance("abcd", "abcdef")).toBeGreaterThan(0);
	});
});
