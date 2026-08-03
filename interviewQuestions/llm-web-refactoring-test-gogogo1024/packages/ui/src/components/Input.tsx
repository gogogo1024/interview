import * as stylex from "@stylexjs/stylex";
import type { ComponentPropsWithoutRef } from "react";
import { colors, semanticColors } from "../tokens/colors.stylex";
import { radii, spacing } from "../tokens/spacing.stylex";
import { fontSize, lineHeight } from "../tokens/typography.stylex";

const styles = stylex.create({
	base: {
		width: "100%",
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.lg,
		paddingRight: spacing.lg,
		borderWidth: "1px",
		borderStyle: "solid",
		borderColor: colors.gray200,
		borderRadius: radii.xl,
		fontSize: fontSize.base,
		lineHeight: lineHeight.normal,
		color: semanticColors.textPrimary,
		backgroundColor: colors.white,
		outline: "none",
		transitionProperty: "border-color, box-shadow",
		transitionDuration: "150ms",
		"::placeholder": {
			color: colors.gray400,
		},
		":focus": {
			borderColor: colors.blue500,
			boxShadow: `0 0 0 3px ${colors.blueAlpha25}`,
		},
	},
	error: {
		borderColor: colors.red500,
		":focus": {
			borderColor: colors.red500,
			boxShadow: `0 0 0 3px rgba(239, 68, 68, 0.25)`,
		},
	},
});

export interface InputProps extends ComponentPropsWithoutRef<"input"> {
	error?: boolean;
}

export function Input({ error, ...props }: InputProps) {
	return <input {...stylex.props(styles.base, error && styles.error)} {...props} />;
}
