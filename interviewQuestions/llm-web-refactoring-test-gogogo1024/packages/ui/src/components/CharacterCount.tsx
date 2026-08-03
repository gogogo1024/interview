import * as stylex from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { fontSize } from "../tokens/typography.stylex";

const styles = stylex.create({
	base: {
		fontSize: fontSize.sm,
		color: colors.gray500,
	},
	warning: {
		color: colors.amber500,
	},
	error: {
		color: colors.red500,
	},
});

export interface CharacterCountProps {
	current: number;
	max: number;
	warningThreshold?: number;
}

export function CharacterCount({ current, max, warningThreshold = 0.9 }: CharacterCountProps) {
	const ratio = current / max;
	const isWarning = ratio >= warningThreshold && ratio < 1;
	const isError = ratio >= 1;

	return (
		<span {...stylex.props(styles.base, isWarning && styles.warning, isError && styles.error)}>
			{current}/{max}
		</span>
	);
}
