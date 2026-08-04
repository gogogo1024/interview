import * as stylex from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";

const spin = stylex.keyframes({
	from: { transform: "rotate(0deg)" },
	to: { transform: "rotate(360deg)" },
});

const styles = stylex.create({
	base: {
		borderRadius: "9999px",
		borderWidth: "2px",
		borderStyle: "solid",
		borderColor: colors.blue200,
		borderTopColor: colors.blue500,
		animationName: spin,
		animationDuration: "1s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
	sm: {
		width: "1rem",
		height: "1rem",
	},
	md: {
		width: "1.5rem",
		height: "1.5rem",
	},
	lg: {
		width: "2rem",
		height: "2rem",
	},
});

export interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
	return <div {...stylex.props(styles.base, styles[size])} />;
}
