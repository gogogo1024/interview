import * as stylex from "@stylexjs/stylex";
import { UserCheck, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { getFollowStatus, toggleFollow } from "../../server/functions/follows";
import { colors, radii, semanticColors, spacing } from "../../tokens.stylex";

const spin = stylex.keyframes({
	from: { transform: "rotate(0deg)" },
	to: { transform: "rotate(360deg)" },
});

const styles = stylex.create({
	button: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingLeft: spacing.lg,
		paddingRight: spacing.lg,
		paddingTop: "0.375rem",
		paddingBottom: "0.375rem",
		borderRadius: radii.lg,
		fontWeight: 600,
		fontSize: "0.8125rem",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		border: "none",
		cursor: "pointer",
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
		},
	},
	followButton: {
		backgroundImage: `linear-gradient(135deg, ${colors.indigo500}, ${colors.blue600})`,
		color: colors.white,
		boxShadow: "0 4px 12px -2px rgba(99, 102, 241, 0.25)",
		":hover": {
			boxShadow: "0 6px 16px -2px rgba(99, 102, 241, 0.35)",
			transform: "translateY(-1px)",
		},
	},
	followingButton: {
		backgroundColor: semanticColors.bgSecondary,
		color: semanticColors.textSecondary,
		borderWidth: "1.5px",
		borderStyle: "solid",
		borderColor: semanticColors.borderSubtle,
		":hover": {
			borderColor: semanticColors.borderDefault,
		},
	},
	unfollowButton: {
		backgroundColor: semanticColors.errorBg,
		color: semanticColors.error,
		borderWidth: "1.5px",
		borderStyle: "solid",
		borderColor: semanticColors.errorBorder,
	},
	spinner: {
		width: "1rem",
		height: "1rem",
		borderWidth: "2px",
		borderStyle: "solid",
		borderColor: "currentColor",
		borderTopColor: "transparent",
		borderRadius: radii.full,
		animationName: spin,
		animationDuration: "0.7s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
		opacity: 0.3,
	},
	icon: {
		width: "1rem",
		height: "1rem",
	},
});

export function FollowButton({ username }: { username: string }) {
	const [following, setFollowing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		loadFollowStatus();
	}, [username]);

	const loadFollowStatus = async () => {
		try {
			const status = await getFollowStatus({ data: username });
			setFollowing(status.following);
		} catch (error) {
			console.error("Failed to load follow status:", error);
		}
	};

	const handleToggle = async () => {
		if (loading) return;
		setLoading(true);

		try {
			const result = await toggleFollow({ data: username });
			setFollowing(result.following);
		} catch (error) {
			console.error("Failed to toggle follow:", error);
		} finally {
			setLoading(false);
		}
	};

	const getButtonStyle = () => {
		if (following) {
			return isHovered ? styles.unfollowButton : styles.followingButton;
		}
		return styles.followButton;
	};

	return (
		<button
			type="button"
			onClick={handleToggle}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			disabled={loading}
			{...stylex.props(styles.button, getButtonStyle())}
		>
			{loading ? (
				<>
					<div {...stylex.props(styles.spinner)} />
					<span>Loading...</span>
				</>
			) : following ? (
				<>
					{isHovered ? (
						<>
							<UserPlus {...stylex.props(styles.icon)} />
							<span>Unfollow</span>
						</>
					) : (
						<>
							<UserCheck {...stylex.props(styles.icon)} />
							<span>Following</span>
						</>
					)}
				</>
			) : (
				<>
					<UserPlus {...stylex.props(styles.icon)} />
					<span>Follow</span>
				</>
			)}
		</button>
	);
}
