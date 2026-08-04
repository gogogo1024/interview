import * as stylex from "@stylexjs/stylex";

/**
 * Typography design tokens for Chirp UI
 */
export const fontFamily = stylex.defineVars({
	sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
	mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
});

export const fontSize = stylex.defineVars({
	xs: "0.75rem", // 12px
	sm: "0.875rem", // 14px
	base: "1rem", // 16px
	lg: "1.125rem", // 18px
	xl: "1.25rem", // 20px
	"2xl": "1.5rem", // 24px
	"3xl": "1.875rem", // 30px
	"4xl": "2.25rem", // 36px
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
