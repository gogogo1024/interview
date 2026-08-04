import * as stylex from "@stylexjs/stylex";

/**
 * Color design tokens for Chirp UI
 * Based on the Tailwind color palette used in the original design
 */
export const colors = stylex.defineVars({
	// White
	white: "#ffffff",

	// Gray scale
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

	// Slate scale (for admin dark theme)
	slate200: "#e2e8f0",
	slate300: "#cbd5e1",
	slate400: "#94a3b8",
	slate500: "#64748b",
	slate600: "#475569",
	slate700: "#334155",
	slate750: "#293548",
	slate800: "#1e293b",
	slate900: "#0f172a",

	// Blue (Primary)
	blue50: "#eff6ff",
	blue100: "#dbeafe",
	blue200: "#bfdbfe",
	blue400: "#60a5fa",
	blue500: "#3b82f6",
	blue600: "#2563eb",
	blue700: "#1d4ed8",
	blue900: "#1e3a8a",

	// Purple
	purple500: "#a855f7",
	purple600: "#9333ea",

	// Red (Error/Destructive)
	red50: "#fef2f2",
	red200: "#fecaca",
	red400: "#f87171",
	red500: "#ef4444",
	red600: "#dc2626",
	red700: "#b91c1c",
	red900: "#7f1d1d",

	// Pink
	pink500: "#ec4899",
	rose500: "#f43f5e",
	fuchsia500: "#d946ef",

	// Green/Teal
	emerald500: "#10b981",
	teal500: "#14b8a6",
	green400: "#4ade80",
	green500: "#22c55e",
	green600: "#16a34a",
	green700: "#15803d",
	green900: "#14532d",
	cyan500: "#06b6d4",

	// Yellow
	yellow500: "#eab308",
	yellow600: "#ca8a04",

	// Orange/Amber
	amber500: "#f59e0b",
	orange500: "#f97316",

	// Indigo
	indigo500: "#6366f1",

	// Transparent variations (for shadows and overlays)
	transparent: "transparent",
	blackAlpha10: "rgba(0, 0, 0, 0.1)",
	blackAlpha25: "rgba(0, 0, 0, 0.25)",
	blueAlpha25: "rgba(59, 130, 246, 0.25)",
	blueAlpha40: "rgba(59, 130, 246, 0.4)",
});

/**
 * Semantic color tokens for common use cases
 */
export const semanticColors = stylex.defineVars({
	// Text
	textPrimary: "#111827", // gray900
	textSecondary: "#4b5563", // gray600
	textTertiary: "#9ca3af", // gray400
	textMuted: "#6b7280", // gray500
	textOnPrimary: "#ffffff", // white

	// Backgrounds
	bgPrimary: "#ffffff", // white
	bgSecondary: "#f3f4f6", // gray100
	bgTertiary: "#f9fafb", // gray50
	bgHover: "#f3f4f6", // gray100

	// Borders
	borderLight: "#f3f4f6", // gray100
	borderDefault: "#e5e7eb", // gray200
	borderFocus: "#3b82f6", // blue500

	// Interactive
	primary: "#3b82f6", // blue500
	primaryHover: "#2563eb", // blue600
	primaryActive: "#1d4ed8", // blue700

	// Feedback
	error: "#dc2626", // red600
	errorLight: "#fef2f2", // red50
	success: "#10b981", // emerald500
	warning: "#f59e0b", // amber500
});
