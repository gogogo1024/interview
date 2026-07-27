import * as stylex from "@stylexjs/stylex";
import { colors, radii } from "../../tokens.stylex";

const styles = stylex.create({
	image: {
		borderRadius: radii.full,
		objectFit: "cover",
		boxShadow: "0 2px 8px -2px rgba(0, 0, 0, 0.12)",
	},
	imageSm: {
		width: "2rem",
		height: "2rem",
	},
	imageMd: {
		width: "2.5rem",
		height: "2.5rem",
	},
	imageLg: {
		width: "4.5rem",
		height: "4.5rem",
	},
	avatar: {
		borderRadius: radii.full,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: colors.white,
		fontWeight: 700,
		boxShadow: "0 2px 8px -2px rgba(0, 0, 0, 0.15)",
		letterSpacing: "-0.025em",
	},
	avatarSm: {
		width: "2rem",
		height: "2rem",
		fontSize: "0.7rem",
	},
	avatarMd: {
		width: "2.5rem",
		height: "2.5rem",
		fontSize: "0.8rem",
	},
	avatarLg: {
		width: "4.5rem",
		height: "4.5rem",
		fontSize: "1.375rem",
	},
});

const gradientStyles = stylex.create({
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

const gradientArray = [
	gradientStyles.gradient0,
	gradientStyles.gradient1,
	gradientStyles.gradient2,
	gradientStyles.gradient3,
	gradientStyles.gradient4,
	gradientStyles.gradient5,
	gradientStyles.gradient6,
	gradientStyles.gradient7,
];

export function UserAvatar({
	avatarUrl,
	username,
	size = "md",
}: {
	avatarUrl?: string | null;
	username: string;
	size?: "sm" | "md" | "lg";
}) {
	const sizeStyle = {
		sm: { image: styles.imageSm, avatar: styles.avatarSm },
		md: { image: styles.imageMd, avatar: styles.avatarMd },
		lg: { image: styles.imageLg, avatar: styles.avatarLg },
	}[size];

	const gradientIndex =
		username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradientArray.length;
	const gradientStyle = gradientArray[gradientIndex];

	if (avatarUrl) {
		return <img src={avatarUrl} alt={username} {...stylex.props(styles.image, sizeStyle.image)} />;
	}

	const initial = username.charAt(0).toUpperCase();
	return <div {...stylex.props(styles.avatar, sizeStyle.avatar, gradientStyle)}>{initial}</div>;
}
