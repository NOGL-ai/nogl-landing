/* eslint-disable no-console */
import type { Page } from "playwright";

const DESKTOP_UAS = [
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
];

const VIEWPORTS = [
	{ width: 1920, height: 1080 },
	{ width: 1366, height: 768 },
	{ width: 1440, height: 900 },
	{ width: 1536, height: 864 },
	{ width: 1600, height: 900 },
];

export const ModernAntiDetection = {
	getRandomUserAgent(): string {
		return DESKTOP_UAS[Math.floor(Math.random() * DESKTOP_UAS.length)];
	},

	getRandomViewport(): { width: number; height: number } {
		return VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
	},

	async setupAdvancedStealth(page: Page): Promise<void> {
		await page.addInitScript(() => {
			Object.defineProperty(navigator, "webdriver", { get: () => undefined });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const w = window as any;
			delete w.cdc_adoQpoasnfa76pfcZLmcfl_Array;
			delete w.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
			delete w.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
			w.chrome = { runtime: { onConnect: undefined, onMessage: undefined } };
			Object.defineProperty(navigator, "plugins", {
				get: () => [
					{ name: "Chrome PDF Plugin", filename: "internal-pdf-viewer" },
					{ name: "Chrome PDF Viewer", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai" },
					{ name: "Native Client", filename: "internal-nacl-plugin" },
				],
			});
			Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en", "de-DE", "de"] });
			Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 4 });
			Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
		});
	},

	async humanLikeDelay(min = 1000, max = 3000): Promise<void> {
		const delay = Math.floor(Math.random() * (max - min + 1)) + min;
		await new Promise((resolve) => setTimeout(resolve, delay));
	},

	async humanLikeScroll(page: Page, direction: "down" | "up" = "down"): Promise<void> {
		const scrollSteps = Math.floor(Math.random() * 3) + 2;
		for (let i = 0; i < scrollSteps; i++) {
			const amount = Math.floor(Math.random() * 400) + 200;
			await page.mouse.wheel(0, direction === "down" ? amount : -amount);
			await this.humanLikeDelay(800, 1500);
		}
	},

	async randomMouseMovement(page: Page): Promise<void> {
		const viewport = page.viewportSize();
		if (!viewport) return;
		const x = Math.floor(Math.random() * viewport.width);
		const y = Math.floor(Math.random() * viewport.height);
		await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 10) + 5 });
	},
};
