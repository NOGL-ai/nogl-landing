// Design System Typography
// Font scales and text styles following Untitled UI design system

export const fontFamily = {
	sans: ["Inter", "system-ui", "sans-serif"],
	mono: ["JetBrains Mono", "Menlo", "Monaco", "monospace"],
	serif: ["Georgia", "Times New Roman", "serif"],
} as const;

export const fontSize = {
	xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
	sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
	base: ["1rem", { lineHeight: "1.5rem" }], // 16px
	lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
	xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
	"2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
	"3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
	"4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
	"5xl": ["3rem", { lineHeight: "1" }], // 48px
	"6xl": ["3.75rem", { lineHeight: "1" }], // 60px
	"7xl": ["4.5rem", { lineHeight: "1" }], // 72px
	"8xl": ["6rem", { lineHeight: "1" }], // 96px
	"9xl": ["8rem", { lineHeight: "1" }], // 128px
} as const;

export const fontWeight = {
	thin: "100",
	extralight: "200",
	light: "300",
	normal: "400",
	medium: "500",
	semibold: "600",
	bold: "700",
	extrabold: "800",
	black: "900",
} as const;

export const letterSpacing = {
	tighter: "-0.05em",
	tight: "-0.025em",
	normal: "0em",
	wide: "0.025em",
	wider: "0.05em",
	widest: "0.1em",
} as const;

// Text styles for common use cases
export const textStyles = {
	// Headings
	h1: {
		fontSize: fontSize["4xl"],
		fontWeight: fontWeight.bold,
		lineHeight: "1.2",
		letterSpacing: letterSpacing.tight,
	},
	h2: {
		fontSize: fontSize["3xl"],
		fontWeight: fontWeight.bold,
		lineHeight: "1.3",
		letterSpacing: letterSpacing.tight,
	},
	h3: {
		fontSize: fontSize["2xl"],
		fontWeight: fontWeight.semibold,
		lineHeight: "1.4",
		letterSpacing: letterSpacing.tight,
	},
	h4: {
		fontSize: fontSize.xl,
		fontWeight: fontWeight.semibold,
		lineHeight: "1.4",
		letterSpacing: letterSpacing.normal,
	},
	h5: {
		fontSize: fontSize.lg,
		fontWeight: fontWeight.medium,
		lineHeight: "1.5",
		letterSpacing: letterSpacing.normal,
	},
	h6: {
		fontSize: fontSize.base,
		fontWeight: fontWeight.medium,
		lineHeight: "1.5",
		letterSpacing: letterSpacing.normal,
	},

	// Body text
	body: {
		fontSize: fontSize.base,
		fontWeight: fontWeight.normal,
		lineHeight: "1.6",
		letterSpacing: letterSpacing.normal,
	},
	bodySmall: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.normal,
		lineHeight: "1.5",
		letterSpacing: letterSpacing.normal,
	},
	bodyLarge: {
		fontSize: fontSize.lg,
		fontWeight: fontWeight.normal,
		lineHeight: "1.7",
		letterSpacing: letterSpacing.normal,
	},

	// Labels and captions
	label: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		lineHeight: "1.4",
		letterSpacing: letterSpacing.wide,
	},
	caption: {
		fontSize: fontSize.xs,
		fontWeight: fontWeight.normal,
		lineHeight: "1.4",
		letterSpacing: letterSpacing.normal,
	},

	// Code
	code: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.normal,
		lineHeight: "1.5",
		letterSpacing: letterSpacing.normal,
		fontFamily: fontFamily.mono,
	},
} as const;

// Utility functions
export const getFontSize = (size: keyof typeof fontSize) => fontSize[size];
export const getFontWeight = (weight: keyof typeof fontWeight) =>
	fontWeight[weight];
export const getTextStyle = (style: keyof typeof textStyles) =>
	textStyles[style];
