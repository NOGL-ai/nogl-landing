// Design System Colors
// Color palette following Untitled UI design system

export const colors = {
	// Primary Colors
	primary: {
		50: "#f0f9ff",
		100: "#e0f2fe",
		200: "#bae6fd",
		300: "#7dd3fc",
		400: "#38bdf8",
		500: "#0ea5e9",
		600: "#0284c7",
		700: "#0369a1",
		800: "#075985",
		900: "#0c4a6e",
		950: "#082f49",
	},

	// Gray Scale
	gray: {
		50: "#f9fafb",
		100: "#f3f4f6",
		200: "#e5e7eb",
		300: "#d1d5db",
		400: "#9ca3af",
		500: "#6b7280",
		600: "#4b5563",
		700: "#374151",
		800: "#1f2937",
		900: "#111827",
		950: "#030712",
	},

	// Semantic Colors
	success: {
		50: "#f0fdf4",
		100: "#dcfce7",
		200: "#bbf7d0",
		300: "#86efac",
		400: "#4ade80",
		500: "#22c55e",
		600: "#16a34a",
		700: "#15803d",
		800: "#166534",
		900: "#14532d",
	},

	warning: {
		50: "#fffbeb",
		100: "#fef3c7",
		200: "#fde68a",
		300: "#fcd34d",
		400: "#fbbf24",
		500: "#f59e0b",
		600: "#d97706",
		700: "#b45309",
		800: "#92400e",
		900: "#78350f",
	},

	error: {
		50: "#fef2f2",
		100: "#fee2e2",
		200: "#fecaca",
		300: "#fca5a5",
		400: "#f87171",
		500: "#ef4444",
		600: "#dc2626",
		700: "#b91c1c",
		800: "#991b1b",
		900: "#7f1d1d",
	},

	info: {
		50: "#eff6ff",
		100: "#dbeafe",
		200: "#bfdbfe",
		300: "#93c5fd",
		400: "#60a5fa",
		500: "#3b82f6",
		600: "#2563eb",
		700: "#1d4ed8",
		800: "#1e40af",
		900: "#1e3a8a",
	},
} as const;

// Color utilities
export const getColorValue = (colorPath: string): string => {
	const [color, shade] = colorPath.split(".");
	return (
		colors[color as keyof typeof colors]?.[
			shade as keyof (typeof colors)[typeof color]
		] || ""
	);
};

// Common color combinations
export const colorCombinations = {
	primary: {
		bg: colors.primary[500],
		text: colors.gray[50],
		hover: colors.primary[600],
	},
	secondary: {
		bg: colors.gray[100],
		text: colors.gray[900],
		hover: colors.gray[200],
	},
	success: {
		bg: colors.success[500],
		text: colors.gray[50],
		hover: colors.success[600],
	},
	warning: {
		bg: colors.warning[500],
		text: colors.gray[50],
		hover: colors.warning[600],
	},
	error: {
		bg: colors.error[500],
		text: colors.gray[50],
		hover: colors.error[600],
	},
} as const;
