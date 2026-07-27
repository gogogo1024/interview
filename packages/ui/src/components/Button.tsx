import * as stylex from "@stylexjs/stylex";
import type { ComponentPropsWithoutRef } from "react";
import { colors, semanticColors } from "../tokens/colors.stylex";
import { radii, shadows, spacing } from "../tokens/spacing.stylex";
import { fontWeight } from "../tokens/typography.stylex";

const styles = stylex.create({
	base: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.sm,
		fontWeight: fontWeight.medium,
		borderRadius: radii.full,
		transitionProperty: "all",
		transitionDuration: "150ms",
		transitionTimingFunction: "ease-in-out",
		cursor: "pointer",
		border: "none",
		outline: "none",
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
		},
	},
	// Variants
	primary: {
		backgroundImage: `linear-gradient(to bottom right, ${colors.blue500}, ${colors.blue600})`,
		color: colors.white,
		boxShadow: shadows.blueSm,
		":hover": {
			boxShadow: shadows.blueMd,
		},
	},
	secondary: {
		backgroundColor: colors.white,
		color: semanticColors.textSecondary,
		borderWidth: "1px",
		borderStyle: "solid",
		borderColor: colors.gray200,
		":hover": {
			backgroundColor: colors.gray100,
			color: semanticColors.textPrimary,
		},
	},
	ghost: {
		backgroundColor: "transparent",
		color: semanticColors.textSecondary,
		":hover": {
			backgroundColor: colors.gray100,
			color: semanticColors.textPrimary,
		},
	},
	danger: {
		backgroundColor: "transparent",
		color: semanticColors.textSecondary,
		":hover": {
			backgroundColor: colors.red50,
			color: colors.red600,
		},
	},
	// Sizes
	sm: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
		fontSize: "0.875rem",
	},
	md: {
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.lg,
		paddingRight: spacing.lg,
		fontSize: "0.875rem",
	},
	lg: {
		paddingTop: spacing.lg,
		paddingBottom: spacing.lg,
		paddingLeft: spacing.xl,
		paddingRight: spacing.xl,
		fontSize: "1rem",
	},
	// Full width
	fullWidth: {
		width: "100%",
	},
});

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
	variant?: "primary" | "secondary" | "ghost" | "danger";
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
}

export function Button({
	variant = "primary",
	size = "md",
	fullWidth = false,
	children,
	...props
}: ButtonProps) {
	return (
		<button
			{...stylex.props(styles.base, styles[variant], styles[size], fullWidth && styles.fullWidth)}
			{...props}
		>
			{children}
		</button>
	);
}
