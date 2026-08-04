import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock StyleX
vi.mock("@stylexjs/stylex", () => ({
	default: {
		create: (styles: Record<string, unknown>) => styles,
		props: (..._args: unknown[]) => ({ className: "mocked-stylex" }),
		keyframes: (_frames: Record<string, unknown>) => "mocked-keyframe",
	},
	create: (styles: Record<string, unknown>) => styles,
	props: (..._args: unknown[]) => ({ className: "mocked-stylex" }),
	keyframes: (_frames: Record<string, unknown>) => "mocked-keyframe",
}));

// Mock the color tokens
vi.mock("../src/tokens/colors.stylex", () => ({
	colors: {
		white: "#ffffff",
		gray100: "#f3f4f6",
		gray200: "#e5e7eb",
		gray400: "#9ca3af",
		gray500: "#6b7280",
		blue200: "#bfdbfe",
		blue500: "#3b82f6",
		blue600: "#2563eb",
		blueAlpha25: "rgba(59, 130, 246, 0.25)",
		red50: "#fef2f2",
		red500: "#ef4444",
		red600: "#dc2626",
		purple500: "#a855f7",
		purple600: "#9333ea",
		pink500: "#ec4899",
		rose500: "#f43f5e",
		emerald500: "#10b981",
		teal500: "#14b8a6",
		amber500: "#f59e0b",
		orange500: "#f97316",
		indigo500: "#6366f1",
		cyan500: "#06b6d4",
		fuchsia500: "#d946ef",
		green500: "#22c55e",
	},
	semanticColors: {
		textPrimary: "#111827",
		textSecondary: "#4b5563",
		primary: "#3b82f6",
		error: "#dc2626",
	},
}));

// Mock spacing tokens
vi.mock("../src/tokens/spacing.stylex", () => ({
	spacing: {
		xs: "4px",
		sm: "8px",
		md: "12px",
		lg: "16px",
		xl: "24px",
	},
	radii: {
		sm: "4px",
		md: "8px",
		lg: "12px",
		xl: "16px",
		"2xl": "24px",
		full: "9999px",
	},
	shadows: {
		sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
		md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
		blueSm: "0 4px 14px 0 rgba(59, 130, 246, 0.39)",
		blueMd: "0 6px 20px 0 rgba(59, 130, 246, 0.39)",
	},
}));

// Mock typography tokens
vi.mock("../src/tokens/typography.stylex", () => ({
	fontWeight: {
		normal: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
	},
	fontSize: {
		xs: "0.75rem",
		sm: "0.875rem",
		base: "1rem",
		lg: "1.125rem",
	},
	lineHeight: {
		none: 1,
		tight: 1.25,
		snug: 1.375,
		normal: 1.5,
		relaxed: 1.625,
		loose: 2,
	},
}));
