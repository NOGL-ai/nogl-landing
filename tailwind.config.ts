const config = {
	darkMode: "class", // Enable class-based dark mode (used by next-themes)
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/styles/**/*.{css,scss}",
	],
	theme: {
		extend: {
			colors: {
			// Text semantic tokens - direct CSS variable references
			primary: "var(--color-text-primary)",
			secondary: "var(--color-text-secondary)",
			tertiary: "var(--color-text-tertiary)",
			quaternary: "var(--color-text-quaternary)",
			disabled: "var(--color-text-disabled)",
			placeholder: "var(--color-text-tertiary)",
			placeholder_subtle: "var(--color-text-quaternary)",
				
			// Background semantic tokens
			background: "var(--color-bg-primary)",
			primary_hover: "var(--color-bg-secondary)",
			secondary_bg: "var(--color-bg-secondary)",
			disabled_subtle: "var(--color-bg-disabled)",
			brand: "var(--color-bg-brand)",
			
			// Border semantic tokens
			border: "var(--color-border-primary)",
			disabled_border: "var(--color-border-disabled)",
			
			// Foreground (fg-) tokens for icons and decorative elements
			"fg-quaternary": "var(--color-text-quaternary)",
			"fg-quaternary_hover": "var(--color-text-tertiary)",
			"fg-disabled": "var(--color-text-disabled)",
			"fg-disabled_subtle": "var(--color-text-disabled)",
			"fg-white": "#ffffff",
			"fg-brand-primary": "var(--color-text-brand)",
			"fg-brand-secondary_alt": "var(--color-text-brand-secondary)",
			"fg-brand-secondary_hover": "var(--color-text-brand)",
			"fg-error-primary": "var(--color-text-error)",
			"fg-error-secondary": "var(--color-text-error-secondary)",
			"fg-success-secondary": "var(--color-text-success-secondary)",
			},
			fontFamily: {
				sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Arial", "sans-serif"],
				mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
				serif: ["Georgia", "Times New Roman", "serif"],
			},
			animation: {
				"shimmer-slide":
					"shimmer-slide var(--speed) ease-in-out infinite alternate",
				"spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
			},
			keyframes: {
				"shimmer-slide": {
					to: {
						transform: "translate(calc(100cqw - 100%), 0)",
					},
				},
				"spin-around": {
					"0%": {
						transform: "translateZ(0) rotate(0)",
					},
					"15%, 35%": {
						transform: "translateZ(0) rotate(90deg)",
					},
					"65%, 85%": {
						transform: "translateZ(0) rotate(270deg)",
					},
					"100%": {
						transform: "translateZ(0) rotate(360deg)",
					},
				},
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
};

export default config;
