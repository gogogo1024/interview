import * as stylex from "@stylexjs/stylex";
import { colors, radii } from "../../tokens.stylex";

const spin = stylex.keyframes({
	from: { transform: "rotate(0deg)" },
	to: { transform: "rotate(360deg)" },
});

const styles = stylex.create({
	container: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	spinner: {
		borderRadius: radii.full,
		borderStyle: "solid",
		borderColor: colors.blue200,
		borderTopColor: colors.blue600,
		animationName: spin,
		animationDuration: "1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
	spinnerSm: {
		width: "1.25rem",
		height: "1.25rem",
		borderWidth: "2px",
	},
	spinnerMd: {
		width: "2rem",
		height: "2rem",
		borderWidth: "2px",
	},
	spinnerLg: {
		width: "3rem",
		height: "3rem",
		borderWidth: "3px",
	},
});

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
	const sizeStyle = {
		sm: styles.spinnerSm,
		md: styles.spinnerMd,
		lg: styles.spinnerLg,
	}[size];

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.spinner, sizeStyle)} />
		</div>
	);
}
