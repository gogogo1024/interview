import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { PostList } from "../components/posts/PostList";
import { getCurrentUser } from "../server/functions/auth";
import { getBookmarkedPosts } from "../server/functions/bookmarks";
import { colors, radii, semanticColors, shadows, spacing } from "../tokens.stylex";

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
	header: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
		marginBottom: spacing["2xl"],
	},
	iconBox: {
		width: "2.25rem",
		height: "2.25rem",
		borderRadius: radii.lg,
		backgroundImage: `linear-gradient(135deg, ${colors.blue500}, ${colors.indigo500})`,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		boxShadow: "0 4px 12px -2px rgba(59, 130, 246, 0.25)",
	},
	title: {
		fontSize: "1.25rem",
		fontWeight: 700,
		color: semanticColors.textPrimary,
		letterSpacing: "-0.025em",
	},
	subtitle: {
		fontSize: "0.75rem",
		color: semanticColors.textSecondary,
	},
	card: {
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.xl,
		boxShadow: shadows.card,
		overflow: "hidden",
	},
	emptyState: {
		padding: spacing["3xl"],
		textAlign: "center",
	},
	emptyIcon: {
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
	emptyTitle: {
		fontSize: "1rem",
		fontWeight: 600,
		color: semanticColors.textPrimary,
		marginBottom: spacing.xs,
	},
	emptyText: {
		color: semanticColors.textSecondary,
		fontSize: "0.875rem",
	},
	loginPrompt: {
		textAlign: "center",
		padding: spacing["2xl"],
	},
	loginLink: {
		color: colors.indigo500,
		fontWeight: 600,
		textDecoration: "none",
		":hover": {
			color: colors.indigo600,
		},
	},
	loadingState: {
		padding: spacing["2xl"],
		textAlign: "center",
		color: semanticColors.textSecondary,
		fontSize: "0.875rem",
	},
	postsContainer: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.md,
	},
});

export const Route = createFileRoute("/bookmarks")({
	component: BookmarksPage,
});

function BookmarksPage() {
	const [posts, setPosts] = useState<any[]>([]);
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const currentUser = await getCurrentUser();
			setUser(currentUser);

			if (currentUser) {
				const bookmarkedPosts = await getBookmarkedPosts({ data: {} });
				setPosts(bookmarkedPosts);
			}
		} catch (error) {
			console.error("Failed to load bookmarks:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div {...stylex.props(styles.container)}>
				<div {...stylex.props(styles.card, styles.loadingState)}>Loading bookmarks...</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div {...stylex.props(styles.container)}>
				<div {...stylex.props(styles.card, styles.loginPrompt)}>
					<p {...stylex.props(styles.emptyText)}>
						Please{" "}
						<Link to="/auth/login" {...stylex.props(styles.loginLink)}>
							log in
						</Link>{" "}
						to view your bookmarks.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.header)}>
				<div {...stylex.props(styles.iconBox)}>
					<Bookmark size={20} color="white" />
				</div>
				<div>
					<h1 {...stylex.props(styles.title)}>Bookmarks</h1>
					<p {...stylex.props(styles.subtitle)}>Your saved posts</p>
				</div>
			</div>

			{posts.length === 0 ? (
				<div {...stylex.props(styles.card, styles.emptyState)}>
					<div {...stylex.props(styles.emptyIcon)}>
						<Bookmark size={32} color={colors.gray400} />
					</div>
					<h3 {...stylex.props(styles.emptyTitle)}>No bookmarks yet</h3>
					<p {...stylex.props(styles.emptyText)}>Save posts to find them easily later</p>
				</div>
			) : (
				<div {...stylex.props(styles.postsContainer)}>
					<PostList
						posts={posts}
						loading={false}
						currentUserId={user?.id}
						onPostDelete={loadData}
					/>
				</div>
			)}
		</div>
	);
}
