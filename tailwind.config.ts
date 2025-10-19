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
			// =========================================================================
			// DEPRECATED: Legacy shorthand names (to be removed in future)
			// ⚠️  DO NOT USE THESE IN NEW CODE - Use Untitled UI standard names below
			// 📝  See docs/design-system/DESIGN_TOKENS_MIGRATION_GUIDE.md
			// =========================================================================
			primary: "var(--color-text-primary)", // ⚠️  DEPRECATED - Use text-primary
			secondary: "var(--color-text-secondary)", // ⚠️  DEPRECATED - Use text-secondary
			tertiary: "var(--color-text-tertiary)", // ⚠️  DEPRECATED - Use text-tertiary
			quaternary: "var(--color-text-quaternary)", // ⚠️  DEPRECATED - Use text-quaternary
			disabled: "var(--color-text-disabled)", // ⚠️  DEPRECATED - Use text-disabled
			placeholder: "var(--color-text-tertiary)", // ⚠️  DEPRECATED - Use text-placeholder
			placeholder_subtle: "var(--color-text-quaternary)", // ⚠️  DEPRECATED - Use text-placeholder-subtle
			background: "var(--color-bg-primary)", // ⚠️  DEPRECATED - Use bg-primary
			primary_hover: "var(--color-bg-secondary)", // ⚠️  DEPRECATED - Use bg-secondary or hover:bg-secondary
			secondary_bg: "var(--color-bg-secondary)", // ⚠️  DEPRECATED - Use bg-secondary
			disabled_subtle: "var(--color-bg-disabled)", // ⚠️  DEPRECATED - Use bg-disabled
			brand: "var(--color-bg-brand)", // ⚠️  DEPRECATED - Use bg-brand
			border: "var(--color-border-primary)", // ⚠️  DEPRECATED - Use border-primary
			disabled_border: "var(--color-border-disabled)", // ⚠️  DEPRECATED - Use border-disabled
			
			// =========================================================================
			// ✅ UNTITLED UI STANDARD TOKENS - USE THESE FOR ALL NEW CODE
			// =========================================================================
			
			// -------------------------------------------------------------------------
			// TEXT TOKENS - For text content and typography
			// Usage: className="text-text-primary" or className="text-text-brand"
			// -------------------------------------------------------------------------
			"text-primary": "var(--color-text-primary)", // Primary text - headings, body
			"text-secondary": "var(--color-text-secondary)", // Secondary text - supporting content
			"text-tertiary": "var(--color-text-tertiary)", // Tertiary text - metadata, captions
			"text-quaternary": "var(--color-text-quaternary)", // Quaternary text - very subtle hints
			"text-disabled": "var(--color-text-disabled)", // Disabled state text
			"text-placeholder": "var(--color-text-tertiary)", // Input placeholder text
			"text-placeholder-subtle": "var(--color-text-quaternary)", // Subtle placeholder text
			"text-on-brand": "var(--color-text-on-brand)", // Text on brand backgrounds
			"text-on-brand-secondary": "var(--color-text-on-brand-secondary)", // Secondary text on brand
			
			// Brand text colors
			"text-brand": "var(--color-text-brand)", // Brand colored text
			"text-brand-secondary": "var(--color-text-brand-secondary)", // Secondary brand text
			
			// Semantic text colors
			"text-error": "var(--color-text-error)", // Error state text
			"text-error-secondary": "var(--color-text-error-secondary)", // Secondary error text
			"text-warning": "var(--color-text-warning)", // Warning state text
			"text-warning-secondary": "var(--color-text-warning-secondary)", // Secondary warning text
			"text-success": "var(--color-text-success)", // Success state text
			"text-success-secondary": "var(--color-text-success-secondary)", // Secondary success text
			
			// -------------------------------------------------------------------------
			// BACKGROUND TOKENS - For element backgrounds
			// Usage: className="bg-bg-primary" or className="bg-bg-brand-solid"
			// -------------------------------------------------------------------------
			"bg-primary": "var(--color-bg-primary)", // Primary background - main canvas
			"bg-secondary": "var(--color-bg-secondary)", // Secondary background - subtle contrast
			"bg-tertiary": "var(--color-bg-tertiary)", // Tertiary background - more contrast
			"bg-quaternary": "var(--color-bg-quaternary)", // Quaternary background - highest contrast
			"bg-disabled": "var(--color-bg-disabled)", // Disabled state background
			"bg-disabled-subtle": "var(--color-bg-disabled)", // Subtle disabled background
			
			// Brand backgrounds
			"bg-brand": "var(--color-bg-brand)", // Brand background - subtle
			"bg-brand-secondary": "var(--color-bg-brand-secondary)", // Secondary brand background
			"bg-brand-solid": "var(--color-bg-brand-solid)", // Solid brand background
			"bg-brand-solid-hover": "var(--color-bg-brand-solid_hover)", // Solid brand hover state
			"bg-brand-solid-active": "var(--color-bg-brand-solid_active)", // Solid brand active state
			"bg-brand-solid-disabled": "var(--color-bg-brand-solid_disabled)", // Solid brand disabled
			
			// Error backgrounds
			"bg-error": "var(--color-bg-error)", // Error background - subtle
			"bg-error-solid": "var(--color-bg-error-solid)", // Solid error background
			"bg-error-solid-hover": "var(--color-bg-error-solid_hover)", // Solid error hover
			"bg-error-solid-active": "var(--color-bg-error-solid_active)", // Solid error active
			"bg-error-solid-disabled": "var(--color-bg-error-solid_disabled)", // Solid error disabled
			
			// Warning backgrounds
			"bg-warning": "var(--color-bg-warning)", // Warning background - subtle
			"bg-warning-solid": "var(--color-bg-warning-solid)", // Solid warning background
			"bg-warning-solid-hover": "var(--color-bg-warning-solid_hover)", // Solid warning hover
			"bg-warning-solid-active": "var(--color-bg-warning-solid_active)", // Solid warning active
			"bg-warning-solid-disabled": "var(--color-bg-warning-solid_disabled)", // Solid warning disabled
			
			// Success backgrounds
			"bg-success": "var(--color-bg-success)", // Success background - subtle
			"bg-success-solid": "var(--color-bg-success-solid)", // Solid success background
			"bg-success-solid-hover": "var(--color-bg-success-solid_hover)", // Solid success hover
			"bg-success-solid-active": "var(--color-bg-success-solid_active)", // Solid success active
			"bg-success-solid-disabled": "var(--color-bg-success-solid_disabled)", // Solid success disabled
			
			// -------------------------------------------------------------------------
			// BORDER TOKENS - For borders and dividers
			// Usage: className="border-border-primary" or className="border-border-brand"
			// -------------------------------------------------------------------------
			"border-primary": "var(--color-border-primary)", // Primary borders - standard dividers
			"border-secondary": "var(--color-border-secondary)", // Secondary borders - subtle
			"border-tertiary": "var(--color-border-tertiary)", // Tertiary borders - very subtle
			"border-disabled": "var(--color-border-disabled)", // Disabled state borders
			"border-disabled-subtle": "var(--color-border-disabled_subtle)", // Subtle disabled borders
			
			// Brand borders
			"border-brand": "var(--color-border-brand)", // Brand colored border
			"border-brand-solid": "var(--color-border-brand-solid)", // Solid brand border
			"border-brand-solid-hover": "var(--color-border-brand-solid_hover)", // Brand border hover
			"border-brand-solid-active": "var(--color-border-brand-solid_active)", // Brand border active
			"border-brand-solid-disabled": "var(--color-border-brand-solid_disabled)", // Brand border disabled
			"border-brand-alt": "var(--color-border-brand_alt)", // Alternative brand border
			
			// Error borders
			"border-error": "var(--color-border-error)", // Error state border
			"border-error-solid": "var(--color-border-error-solid)", // Solid error border
			"border-error-solid-hover": "var(--color-border-error-solid_hover)", // Error border hover
			"border-error-solid-active": "var(--color-border-error-solid_active)", // Error border active
			"border-error-solid-disabled": "var(--color-border-error-solid_disabled)", // Error border disabled
			"border-error-alt": "var(--color-border-error_alt)", // Alternative error border
			"border-error-subtle": "var(--color-border-error_subtle)", // Subtle error border
			
			// -------------------------------------------------------------------------
			// FOREGROUND TOKENS - For icons and decorative elements
			// Already following Untitled UI conventions with fg- prefix ✅
			// -------------------------------------------------------------------------
			"fg-quaternary": "var(--color-text-quaternary)",
			"fg-quaternary_hover": "var(--color-text-tertiary)",
			"fg-quaternary-hover": "var(--color-text-tertiary)", // Untitled UI compliant name
			"fg-disabled": "var(--color-text-disabled)",
			"fg-disabled_subtle": "var(--color-text-disabled)",
			"fg-disabled-subtle": "var(--color-text-disabled)", // Untitled UI compliant name
			"fg-white": "#ffffff",
			"fg-brand-primary": "var(--color-text-brand)",
			"fg-brand-secondary": "var(--color-text-brand-secondary)",
			"fg-brand-secondary_alt": "var(--color-text-brand-secondary)", // Legacy
			"fg-brand-secondary_hover": "var(--color-text-brand)", // Legacy
			"fg-brand-secondary-hover": "var(--color-text-brand)", // Untitled UI compliant
			"fg-error-primary": "var(--color-text-error)",
			"fg-error-secondary": "var(--color-text-error-secondary)",
			"fg-success-primary": "var(--color-text-success)",
			"fg-success-secondary": "var(--color-text-success-secondary)",
			"fg-warning-primary": "var(--color-text-warning)",
			"fg-warning-secondary": "var(--color-text-warning-secondary)",
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
