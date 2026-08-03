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
		fontSize: fontSize.lg,
		lineHeight: lineHeight.relaxed,
		color: semanticColors.textPrimary,
		backgroundColor: colors.white,
		outline: "none",
		resize: "none",
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
	borderless: {
		borderWidth: 0,
		padding: 0,
		":focus": {
			boxShadow: "none",
		},
	},
});

export interface TextAreaProps extends ComponentPropsWithoutRef<"textarea"> {
	borderless?: boolean;
}

export function TextArea({ borderless, ...props }: TextAreaProps) {
	return <textarea {...stylex.props(styles.base, borderless && styles.borderless)} {...props} />;
}
