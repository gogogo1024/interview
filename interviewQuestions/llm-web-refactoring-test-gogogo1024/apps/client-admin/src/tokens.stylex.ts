import * as stylex from "@stylexjs/stylex";

/**
 * Design tokens for Chirp UI with automatic dark/light theme support.
 * Uses stylex.types.color() with @media (prefers-color-scheme: dark) for
 * zero-JS automatic theme switching via CSS custom properties.
 */

const DARK = "@media (prefers-color-scheme: dark)";

// ===== PALETTE TOKENS - Static constants, do NOT change with theme =====
export const colors = stylex.defineVars({
	white: "#ffffff",
	gray50: "#f9fafb",
	gray100: "#f3f4f6",
	gray200: "#e5e7eb",
	gray300: "#d1d5db",
	gray400: "#9ca3af",
	gray500: "#6b7280",
	gray600: "#4b5563",
	gray700: "#374151",
	gray800: "#1f2937",
	gray900: "#111827",
	slate200: "#e2e8f0",
	slate300: "#cbd5e1",
	slate400: "#94a3b8",
	slate500: "#64748b",
	slate600: "#475569",
	slate700: "#334155",
	slate750: "#293548",
	slate800: "#1e293b",
	slate900: "#0f172a",
	blue50: "#eff6ff",
	blue100: "#dbeafe",
	blue200: "#bfdbfe",
	blue400: "#60a5fa",
	blue500: "#3b82f6",
	blue600: "#2563eb",
	blue700: "#1d4ed8",
	blue900: "#1e3a8a",
	purple500: "#a855f7",
	purple600: "#9333ea",
	red50: "#fef2f2",
	red200: "#fecaca",
	red400: "#f87171",
	red500: "#ef4444",
	red600: "#dc2626",
	red700: "#b91c1c",
	red900: "#7f1d1d",
	pink500: "#ec4899",
	rose500: "#f43f5e",
	fuchsia500: "#d946ef",
	emerald500: "#10b981",
	teal500: "#14b8a6",
	green400: "#4ade80",
	green500: "#22c55e",
	green600: "#16a34a",
	green700: "#15803d",
	green900: "#14532d",
	cyan500: "#06b6d4",
	yellow500: "#eab308",
	yellow600: "#ca8a04",
	amber500: "#f59e0b",
	orange500: "#f97316",
	indigo500: "#6366f1",
	indigo400: "#818cf8",
	indigo600: "#4f46e5",
	violet500: "#8b5cf6",
	violet600: "#7c3aed",
	transparent: "transparent",
	blackAlpha5: "rgba(0, 0, 0, 0.05)",
	blackAlpha10: "rgba(0, 0, 0, 0.1)",
	blackAlpha25: "rgba(0, 0, 0, 0.25)",
	whiteAlpha10: "rgba(255, 255, 255, 0.1)",
	whiteAlpha20: "rgba(255, 255, 255, 0.2)",
	blueAlpha10: "rgba(59, 130, 246, 0.1)",
	blueAlpha25: "rgba(59, 130, 246, 0.25)",
	blueAlpha40: "rgba(59, 130, 246, 0.4)",
	indigoAlpha10: "rgba(99, 102, 241, 0.1)",
	indigoAlpha20: "rgba(99, 102, 241, 0.2)",
	indigoAlpha30: "rgba(99, 102, 241, 0.3)",
});

// ===== SEMANTIC TOKENS - Adapt to light/dark theme automatically =====
export const semanticColors = stylex.defineVars({
	// Text
	textPrimary: stylex.types.color({ default: "#111827", [DARK]: "#f1f5f9" }),
	textSecondary: stylex.types.color({ default: "#4b5563", [DARK]: "#94a3b8" }),
	textTertiary: stylex.types.color({ default: "#9ca3af", [DARK]: "#64748b" }),
	textMuted: stylex.types.color({ default: "#6b7280", [DARK]: "#64748b" }),
	textOnPrimary: stylex.types.color({ default: "#ffffff", [DARK]: "#ffffff" }),

	// Backgrounds
	bgPrimary: stylex.types.color({ default: "#ffffff", [DARK]: "#0f172a" }),
	bgSecondary: stylex.types.color({ default: "#f3f4f6", [DARK]: "#1e293b" }),
	bgTertiary: stylex.types.color({ default: "#f9fafb", [DARK]: "#1e293b" }),
	bgHover: stylex.types.color({ default: "#f3f4f6", [DARK]: "#293548" }),

	// Surfaces
	surfaceCard: stylex.types.color({ default: "#ffffff", [DARK]: "rgba(30, 41, 59, 0.6)" }),
	surfaceOverlay: stylex.types.color({
		default: "rgba(255, 255, 255, 0.72)",
		[DARK]: "rgba(15, 23, 42, 0.85)",
	}),
	surfaceInput: stylex.types.color({
		default: "rgba(248, 250, 252, 0.5)",
		[DARK]: "rgba(51, 65, 85, 0.5)",
	}),

	// Borders
	borderLight: stylex.types.color({ default: "#f3f4f6", [DARK]: "rgba(51, 65, 85, 0.5)" }),
	borderDefault: stylex.types.color({ default: "#e5e7eb", [DARK]: "rgba(51, 65, 85, 0.6)" }),
	borderSubtle: stylex.types.color({
		default: "rgba(226, 232, 240, 0.6)",
		[DARK]: "rgba(51, 65, 85, 0.5)",
	}),
	borderFocus: stylex.types.color({ default: "#3b82f6", [DARK]: "#818cf8" }),

	// Interactive
	primary: stylex.types.color({ default: "#3b82f6", [DARK]: "#6366f1" }),
	primaryHover: stylex.types.color({ default: "#2563eb", [DARK]: "#818cf8" }),
	primaryActive: stylex.types.color({ default: "#1d4ed8", [DARK]: "#4f46e5" }),
	primaryLight: stylex.types.color({
		default: "rgba(99, 102, 241, 0.08)",
		[DARK]: "rgba(99, 102, 241, 0.12)",
	}),

	// Status
	error: stylex.types.color({ default: "#dc2626", [DARK]: "#f87171" }),
	errorLight: stylex.types.color({ default: "#fef2f2", [DARK]: "rgba(239, 68, 68, 0.1)" }),
	errorBg: stylex.types.color({
		default: "rgba(239, 68, 68, 0.06)",
		[DARK]: "rgba(239, 68, 68, 0.1)",
	}),
	errorBorder: stylex.types.color({
		default: "rgba(239, 68, 68, 0.12)",
		[DARK]: "rgba(239, 68, 68, 0.2)",
	}),
	success: stylex.types.color({ default: "#10b981", [DARK]: "#4ade80" }),
	warning: stylex.types.color({ default: "#f59e0b", [DARK]: "#fbbf24" }),
});

export const spacing = stylex.defineVars({
	none: "0",
	xs: "0.25rem",
	sm: "0.5rem",
	md: "0.75rem",
	lg: "1rem",
	xl: "1.25rem",
	"2xl": "1.5rem",
	"3xl": "2rem",
	"4xl": "2.5rem",
	"5xl": "3rem",
	1: "0.25rem",
	2: "0.5rem",
	3: "0.75rem",
	4: "1rem",
	5: "1.25rem",
	6: "1.5rem",
	8: "2rem",
	10: "2.5rem",
	12: "3rem",
	16: "4rem",
});

export const radii = stylex.defineVars({
	none: "0",
	sm: "0.25rem",
	md: "0.375rem",
	lg: "0.5rem",
	xl: "0.75rem",
	"2xl": "1rem",
	full: "9999px",
});

export const shadows = stylex.defineVars({
	none: "none",
	sm: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
	md: "0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
	lg: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)",
	xl: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.06)",
	"2xl": "0 25px 50px -12px rgb(0 0 0 / 0.15)",
	blueSm: "0 4px 14px 0 rgba(59, 130, 246, 0.2)",
	blueMd: "0 8px 24px 0 rgba(59, 130, 246, 0.3)",
	indigoSm: "0 4px 14px 0 rgba(99, 102, 241, 0.2)",
	indigoMd: "0 8px 24px 0 rgba(99, 102, 241, 0.3)",
	indigoGlow: "0 0 20px 0 rgba(99, 102, 241, 0.15)",
	card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.02)",
	cardHover: "0 8px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.04)",
});

export const zIndex = stylex.defineVars({
	hide: "-1",
	base: "0",
	dropdown: "10",
	sticky: "20",
	fixed: "30",
	overlay: "40",
	modal: "50",
	popover: "60",
	tooltip: "70",
});

export const fontFamily = stylex.defineVars({
	sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
	mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
});

export const fontSize = stylex.defineVars({
	xs: "0.75rem",
	sm: "0.875rem",
	base: "1rem",
	lg: "1.125rem",
	xl: "1.25rem",
	"2xl": "1.5rem",
	"3xl": "1.875rem",
	"4xl": "2.25rem",
});

export const lineHeight = stylex.defineVars({
	none: "1",
	tight: "1.25",
	snug: "1.375",
	normal: "1.5",
	relaxed: "1.625",
	loose: "2",
});

export const fontWeight = stylex.defineVars({
	normal: "400",
	medium: "500",
	semibold: "600",
	bold: "700",
});

export const letterSpacing = stylex.defineVars({
	tighter: "-0.05em",
	tight: "-0.025em",
	normal: "0",
	wide: "0.025em",
	wider: "0.05em",
});
