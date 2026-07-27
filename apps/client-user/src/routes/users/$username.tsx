import * as stylex from "@stylexjs/stylex";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Users, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { PostList } from "../../components/posts/PostList";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { FollowButton } from "../../components/users/FollowButton";
import { UserAvatar } from "../../components/users/UserAvatar";
import { getCurrentUser } from "../../server/functions/auth";
import { getFollowerCount, getFollowingCount } from "../../server/functions/follows";
import { getUserPosts } from "../../server/functions/posts";
import { getUser } from "../../server/functions/users";
import {
	colors,
	fontSize,
	fontWeight,
	radii,
	semanticColors,
	shadows,
	spacing,
} from "../../tokens.stylex";

export const Route = createFileRoute("/users/$username")({
	component: UserProfilePage,
});

const styles = stylex.create({
	container: {
		maxWidth: "42rem",
		marginLeft: "auto",
		marginRight: "auto",
		paddingLeft: spacing.lg,
		paddingRight: spacing.lg,
		paddingTop: spacing["2xl"],
		paddingBottom: spacing["3xl"],
	},
	loadingWrapper: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		minHeight: "60vh",
	},
	notFoundWrapper: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		minHeight: "60vh",
	},
	notFoundContent: {
		textAlign: "center",
	},
	notFoundIcon: {
		width: "3.5rem",
		height: "3.5rem",
		borderRadius: radii.xl,
		backgroundColor: semanticColors.bgSecondary,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginLeft: "auto",
		marginRight: "auto",
		marginBottom: spacing.lg,
	},
	notFoundTitle: {
		fontSize: fontSize.lg,
		fontWeight: fontWeight.semibold,
		color: semanticColors.textPrimary,
		marginBottom: spacing.xs,
	},
	notFoundText: {
		color: semanticColors.textSecondary,
		fontSize: fontSize.sm,
	},
	profileCard: {
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.xl,
		boxShadow: shadows.card,
		overflow: "hidden",
		marginBottom: spacing["2xl"],
	},
	coverGradient: {
		height: "7rem",
		backgroundImage: `linear-gradient(135deg, ${colors.indigo500}, ${colors.purple500}, ${colors.pink500})`,
	},
	profileBody: {
		paddingLeft: spacing["2xl"],
		paddingRight: spacing["2xl"],
		paddingBottom: spacing["2xl"],
	},
	avatarRow: {
		marginTop: "-2.5rem",
		marginBottom: spacing.lg,
		display: "flex",
		alignItems: "flex-end",
		justifyContent: "space-between",
	},
	avatarRing: {
		borderRadius: radii.full,
		boxShadow: `0 0 0 3px ${semanticColors.surfaceCard}`,
	},
	displayName: {
		fontSize: fontSize.xl,
		fontWeight: fontWeight.bold,
		color: semanticColors.textPrimary,
		letterSpacing: "-0.025em",
	},
	username: {
		color: semanticColors.textSecondary,
		fontSize: fontSize.sm,
	},
	bio: {
		marginTop: spacing.md,
		color: semanticColors.textSecondary,
		lineHeight: "1.6",
		fontSize: fontSize.sm,
	},
	stats: {
		display: "flex",
		gap: spacing["2xl"],
		marginTop: spacing.lg,
	},
	statItem: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
	},
	statValue: {
		fontWeight: fontWeight.semibold,
		color: semanticColors.textPrimary,
		fontSize: fontSize.sm,
	},
	statLabel: {
		color: semanticColors.textSecondary,
		fontSize: fontSize.sm,
	},
	postsHeader: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
		marginBottom: spacing.lg,
	},
	postsHeaderIcon: {
		width: "2.25rem",
		height: "2.25rem",
		borderRadius: radii.lg,
		backgroundImage: `linear-gradient(135deg, ${colors.purple500}, ${colors.pink500})`,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		boxShadow: "0 4px 12px -2px rgba(168, 85, 247, 0.25)",
	},
	postsTitle: {
		fontSize: fontSize.lg,
		fontWeight: fontWeight.bold,
		color: semanticColors.textPrimary,
		letterSpacing: "-0.025em",
	},
	iconGray: {
		color: semanticColors.textTertiary,
	},
	iconWhite: {
		color: colors.white,
	},
});

function UserProfilePage() {
	const { username } = Route.useParams();
	const [user, setUser] = useState<any>(null);
	const [posts, setPosts] = useState<any[]>([]);
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [followerCount, setFollowerCount] = useState(0);
	const [followingCount, setFollowingCount] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, [username]);

	const loadData = async () => {
		try {
			const [profileUser, userPosts, currentU, followers, following] = await Promise.all([
				getUser({ data: username }),
				getUserPosts({ data: username }),
				getCurrentUser(),
				getFollowerCount({ data: username }),
				getFollowingCount({ data: username }),
			]);
			setUser(profileUser);
			setPosts(userPosts);
			setCurrentUser(currentU);
			setFollowerCount(followers);
			setFollowingCount(following);
		} catch (error) {
			console.error("Failed to load profile:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div {...stylex.props(styles.loadingWrapper)}>
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (!user) {
		return (
			<div {...stylex.props(styles.notFoundWrapper)}>
				<div {...stylex.props(styles.notFoundContent)}>
					<div {...stylex.props(styles.notFoundIcon)}>
						<UserX size={32} {...stylex.props(styles.iconGray)} />
					</div>
					<h2 {...stylex.props(styles.notFoundTitle)}>User not found</h2>
					<p {...stylex.props(styles.notFoundText)}>The user @{username} doesn't exist.</p>
				</div>
			</div>
		);
	}

	const isOwnProfile = currentUser?.id === user.id;

	return (
		<div {...stylex.props(styles.container)}>
			{/* Profile Header Card */}
			<div {...stylex.props(styles.profileCard)}>
				{/* Cover gradient */}
				<div {...stylex.props(styles.coverGradient)} />

				<div {...stylex.props(styles.profileBody)}>
					{/* Avatar */}
					<div {...stylex.props(styles.avatarRow)}>
						<div {...stylex.props(styles.avatarRing)}>
							<UserAvatar avatarUrl={user.avatarUrl} username={user.username} size="lg" />
						</div>
						{!isOwnProfile && currentUser && <FollowButton username={username} />}
					</div>

					{/* User Info */}
					<div>
						<h1 {...stylex.props(styles.displayName)}>{user.displayName}</h1>
						<p {...stylex.props(styles.username)}>@{user.username}</p>
					</div>

					{user.bio && <p {...stylex.props(styles.bio)}>{user.bio}</p>}

					{/* Stats */}
					<div {...stylex.props(styles.stats)}>
						<div {...stylex.props(styles.statItem)}>
							<Users size={16} {...stylex.props(styles.iconGray)} />
							<span {...stylex.props(styles.statValue)}>{followingCount}</span>
							<span {...stylex.props(styles.statLabel)}>Following</span>
						</div>
						<div {...stylex.props(styles.statItem)}>
							<span {...stylex.props(styles.statValue)}>{followerCount}</span>
							<span {...stylex.props(styles.statLabel)}>Followers</span>
						</div>
					</div>
				</div>
			</div>

			{/* Posts Section */}
			<div {...stylex.props(styles.postsHeader)}>
				<div {...stylex.props(styles.postsHeaderIcon)}>
					<FileText size={20} {...stylex.props(styles.iconWhite)} />
				</div>
				<h2 {...stylex.props(styles.postsTitle)}>Posts</h2>
			</div>

			<PostList posts={posts} currentUserId={currentUser?.id} onPostDelete={loadData} />
		</div>
	);
}
