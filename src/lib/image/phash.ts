import sharp from "sharp";

const SIZE = 32;

/**
 * Perceptual hash (pHash) via 32×32 greyscale → DCT → 8×8 low-frequency block.
 * Returns a 64-bit hex string so callers can persist + compare via Hamming distance.
 */
export async function pHash(input: Buffer | string): Promise<string> {
	const raw = await sharp(input)
		.resize(SIZE, SIZE, { fit: "fill" })
		.greyscale()
		.raw()
		.toBuffer();

	const matrix: number[][] = Array.from({ length: SIZE }, (_, y) =>
		Array.from({ length: SIZE }, (_, x) => raw[y * SIZE + x]),
	);

	const dct = dct2d(matrix);

	// Take top-left 8×8 (excluding the DC coefficient at [0][0] for robustness)
	const vals: number[] = [];
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			if (x === 0 && y === 0) continue;
			vals.push(dct[y][x]);
		}
	}
	const median = [...vals].sort((a, b) => a - b)[Math.floor(vals.length / 2)];

	let bits = "";
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			if (x === 0 && y === 0) {
				bits += "0";
				continue;
			}
			bits += dct[y][x] > median ? "1" : "0";
		}
	}

	return bitsToHex(bits);
}

export function hammingDistance(a: string, b: string): number {
	if (a.length !== b.length) return Math.max(a.length, b.length) * 4;
	const abin = hexToBin(a);
	const bbin = hexToBin(b);
	let count = 0;
	for (let i = 0; i < abin.length; i++) if (abin[i] !== bbin[i]) count++;
	return count;
}

function dct2d(matrix: number[][]): number[][] {
	const n = matrix.length;
	const result: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
	for (let u = 0; u < n; u++) {
		for (let v = 0; v < n; v++) {
			let sum = 0;
			for (let x = 0; x < n; x++) {
				for (let y = 0; y < n; y++) {
					sum += matrix[x][y] *
						Math.cos(((2 * x + 1) * u * Math.PI) / (2 * n)) *
						Math.cos(((2 * y + 1) * v * Math.PI) / (2 * n));
				}
			}
			const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
			const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
			result[u][v] = (2 / n) * cu * cv * sum;
		}
	}
	return result;
}

function bitsToHex(bits: string): string {
	let out = "";
	for (let i = 0; i < bits.length; i += 4) {
		out += parseInt(bits.slice(i, i + 4), 2).toString(16);
	}
	return out.padStart(16, "0");
}

function hexToBin(hex: string): string {
	let out = "";
	for (const ch of hex) {
		out += parseInt(ch, 16).toString(2).padStart(4, "0");
	}
	return out;
}
