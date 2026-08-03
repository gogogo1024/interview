import * as stylex from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { radii, shadows } from "../tokens/spacing.stylex";
import { fontWeight } from "../tokens/typography.stylex";

const styles = stylex.create({
	base: {
		borderRadius: radii.full,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontWeight: fontWeight.bold,
		color: colors.white,
		boxShadow: shadows.md,
		borderWidth: "2px",
		borderStyle: "solid",
		borderColor: colors.white,
		flexShrink: 0,
	},
	image: {
		objectFit: "cover",
	},
	// Sizes
	sm: {
		width: "2rem", // 32px
		height: "2rem",
		fontSize: "0.75rem",
	},
	md: {
		width: "2.5rem", // 40px
		height: "2.5rem",
		fontSize: "0.875rem",
	},
	lg: {
		width: "5rem", // 80px
		height: "5rem",
		fontSize: "1.5rem",
	},
	// Gradient backgrounds
	gradient0: {
		backgroundImage: `linear-gradient(to bottom right, ${colors.blue500}, ${colors.purple600})`,
	},
	gradient1: {
		backgroundImage: `linear-gradient(to bottom right, ${colors.pink500}, ${colors.rose500})`,
	},
	gradient2: {
		backgroundImage: `linear-gradient(to bottom right, ${colors.emerald500}, ${colors.teal500})`,
	},
	gradient3: {
		backgroundImage: `linear-gradient(to bottom right, ${colors.amber500}, ${colors.orange500})`,
	},
	gradient4: {
		backgroundImage: `linear-gradient(to bottom right, ${colors.indigo500}, ${colors.purple500})`,
	},
	gradient5: {
		backgroundImage: `linear-gradient(to bottom right, ${colors.cyan500}, ${colors.blue500})`,
	},
	gradient6: {
		backgroundImage: `linear-gradient(to bottom right, ${colors.fuchsia500}, ${colors.pink500})`,
	},
	gradient7: {
		backgroundImage: `linear-gradient(to bottom right, ${colors.green500}, ${colors.emerald500})`,
	},
});

const gradientStyles = [
	styles.gradient0,
	styles.gradient1,
	styles.gradient2,
	styles.gradient3,
	styles.gradient4,
	styles.gradient5,
	styles.gradient6,
	styles.gradient7,
];

export interface AvatarProps {
	avatarUrl?: string | null;
	username: string;
	size?: "sm" | "md" | "lg";
}

export function Avatar({ avatarUrl, username, size = "md" }: AvatarProps) {
	// Generate a consistent gradient based on username
	const gradientIndex =
		username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradientStyles.length;

	if (avatarUrl) {
		return (
			<img
				src={avatarUrl}
				alt={username}
				{...stylex.props(styles.base, styles.image, styles[size])}
			/>
		);
	}

	// Default avatar with initials and gradient
	const initial = username.charAt(0).toUpperCase();
	return (
		<div {...stylex.props(styles.base, styles[size], gradientStyles[gradientIndex])}>{initial}</div>
	);
}
