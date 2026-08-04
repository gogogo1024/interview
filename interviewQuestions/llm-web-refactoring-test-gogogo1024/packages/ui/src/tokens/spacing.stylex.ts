import * as stylex from "@stylexjs/stylex";

/**
 * Spacing design tokens for Chirp UI
 * Based on 4px base unit (similar to Tailwind's spacing scale)
 */
export const spacing = stylex.defineVars({
	// Core spacing scale
	none: "0",
	xs: "0.25rem", // 4px
	sm: "0.5rem", // 8px
	md: "0.75rem", // 12px
	lg: "1rem", // 16px
	xl: "1.25rem", // 20px
	"2xl": "1.5rem", // 24px
	"3xl": "2rem", // 32px
	"4xl": "2.5rem", // 40px
	"5xl": "3rem", // 48px

	// Specific spacing values
	1: "0.25rem", // 4px
	2: "0.5rem", // 8px
	3: "0.75rem", // 12px
	4: "1rem", // 16px
	5: "1.25rem", // 20px
	6: "1.5rem", // 24px
	8: "2rem", // 32px
	10: "2.5rem", // 40px
	12: "3rem", // 48px
	16: "4rem", // 64px
});

/**
 * Border radius tokens
 */
export const radii = stylex.defineVars({
	none: "0",
	sm: "0.25rem", // 4px
	md: "0.375rem", // 6px
	lg: "0.5rem", // 8px
	xl: "0.75rem", // 12px
	"2xl": "1rem", // 16px
	full: "9999px",
});

/**
 * Shadow tokens
 */
export const shadows = stylex.defineVars({
	none: "none",
	sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
	md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
	lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
	xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
	blueSm: "0 4px 14px 0 rgba(59, 130, 246, 0.25)",
	blueMd: "0 4px 14px 0 rgba(59, 130, 246, 0.4)",
});

/**
 * Z-index tokens
 */
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
