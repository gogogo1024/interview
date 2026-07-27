import * as stylex from "@stylexjs/stylex";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { colors } from "../tokens/colors.stylex";
import { radii, shadows, spacing } from "../tokens/spacing.stylex";

const styles = stylex.create({
	base: {
		backgroundColor: colors.white,
		borderRadius: radii["2xl"],
		boxShadow: shadows.sm,
		borderWidth: "1px",
		borderStyle: "solid",
		borderColor: colors.gray100,
		padding: spacing.xl,
		transitionProperty: "box-shadow",
		transitionDuration: "200ms",
	},
	hoverable: {
		":hover": {
			boxShadow: shadows.md,
		},
	},
	noPadding: {
		padding: 0,
	},
});

export interface CardProps extends ComponentPropsWithoutRef<"article"> {
	children: ReactNode;
	hoverable?: boolean;
	noPadding?: boolean;
}

export function Card({ children, hoverable = false, noPadding = false, ...props }: CardProps) {
	return (
		<article
			{...stylex.props(styles.base, hoverable && styles.hoverable, noPadding && styles.noPadding)}
			{...props}
		>
			{children}
		</article>
	);
}
