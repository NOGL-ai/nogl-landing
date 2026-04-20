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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const w = window as any;

			// navigator.webdriver
			Object.defineProperty(navigator, "webdriver", { get: () => undefined });

			// Remove CDP/automation artifacts
			delete w.cdc_adoQpoasnfa76pfcZLmcfl_Array;
			delete w.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
			delete w.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
			delete w.__playwright;
			delete w.__pw_manual;
			delete w._playwrightWorker;

			// Full window.chrome object — Meta's CometRelay checks ~30 sub-properties
			w.chrome = {
				app: {
					isInstalled: false,
					InstallState: { DISABLED: "disabled", INSTALLED: "installed", NOT_INSTALLED: "not_installed" },
					RunningState: { CANNOT_RUN: "cannot_run", READY_TO_RUN: "ready_to_run", RUNNING: "running" },
					getDetails: function () {},
					getIsInstalled: function () {},
					installState: function () {},
					runningState: function () {},
				},
				csi: function () {},
				loadTimes: function () { return {}; },
				runtime: {
					OnInstalledReason: { CHROME_UPDATE: "chrome_update", INSTALL: "install", SHARED_MODULE_UPDATE: "shared_module_update", UPDATE: "update" },
					OnRestartRequiredReason: { APP_UPDATE: "app_update", OS_UPDATE: "os_update", PERIODIC: "periodic" },
					PlatformArch: { ARM: "arm", ARM64: "arm64", MIPS: "mips", MIPS64: "mips64", X86_32: "x86-32", X86_64: "x86-64" },
					PlatformOs: { ANDROID: "android", CHROMEOS: "cros", LINUX: "linux", MAC: "mac", OPENBSD: "openbsd", WIN: "win" },
					RequestUpdateCheckStatus: { NO_UPDATE: "no_update", THROTTLED: "throttled", UPDATE_AVAILABLE: "update_available" },
					connect: function () {},
					sendMessage: function () {},
					id: undefined,
				},
			};

			// navigator.plugins — realistic Chrome plugin list
			Object.defineProperty(navigator, "plugins", {
				get: () => {
					const plugins = [
						{ name: "Chrome PDF Plugin", filename: "internal-pdf-viewer", description: "Portable Document Format", length: 1 },
						{ name: "Chrome PDF Viewer", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai", description: "", length: 1 },
						{ name: "Native Client", filename: "internal-nacl-plugin", description: "", length: 2 },
					];
					(plugins as any).item = (i: number) => plugins[i] ?? null;
					(plugins as any).namedItem = (n: string) => plugins.find((p) => p.name === n) ?? null;
					(plugins as any).refresh = () => {};
					return plugins;
				},
			});

			// navigator.mimeTypes
			Object.defineProperty(navigator, "mimeTypes", { get: () => ({ length: 4, item: () => null, namedItem: () => null }) });

			// Languages, concurrency, memory
			Object.defineProperty(navigator, "languages", { get: () => ["de-DE", "de", "en-US", "en"] });
			Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
			Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
			Object.defineProperty(navigator, "maxTouchPoints", { get: () => 0 });
			Object.defineProperty(navigator, "platform", { get: () => "Win32" });

			// navigator.connection
			Object.defineProperty(navigator, "connection", {
				get: () => ({ rtt: 50, downlink: 10, effectiveType: "4g", saveData: false }),
			});

			// Notification.permission — blocked sessions often see "denied", real browsers default to "default"
			try {
				Object.defineProperty(Notification, "permission", { get: () => "default" });
			} catch {}

			// Screen properties consistent with 1920×1080
			try {
				Object.defineProperty(screen, "colorDepth", { get: () => 24 });
				Object.defineProperty(screen, "pixelDepth", { get: () => 24 });
			} catch {}

			// WebGL vendor/renderer — spoof as a typical Intel GPU
			const origGetParameter = WebGLRenderingContext.prototype.getParameter;
			WebGLRenderingContext.prototype.getParameter = function (parameter: number) {
				if (parameter === 37445) return "Intel Inc.";    // UNMASKED_VENDOR_WEBGL
				if (parameter === 37446) return "Intel Iris OpenGL Engine"; // UNMASKED_RENDERER_WEBGL
				return origGetParameter.call(this, parameter);
			};
			try {
				const orig2 = WebGL2RenderingContext.prototype.getParameter;
				WebGL2RenderingContext.prototype.getParameter = function (parameter: number) {
					if (parameter === 37445) return "Intel Inc.";
					if (parameter === 37446) return "Intel Iris OpenGL Engine";
					return orig2.call(this, parameter);
				};
			} catch {}

			// Permissions API — cameras/mics/notifications return "prompt" not "denied"
			if (navigator.permissions) {
				const origQuery = navigator.permissions.query.bind(navigator.permissions);
				navigator.permissions.query = (parameters: PermissionDescriptor) => {
					if (["notifications", "camera", "microphone"].includes(parameters.name)) {
						return Promise.resolve({ state: "prompt", onchange: null } as PermissionStatus);
					}
					return origQuery(parameters);
				};
			}
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
