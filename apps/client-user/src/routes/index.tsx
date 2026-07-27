import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { PostForm } from "../components/posts/PostForm";
import { PostList } from "../components/posts/PostList";
import { getCurrentUser } from "../server/functions/auth";
import { getHomeFeed } from "../server/functions/feed";
import { colors, fontSize, fontWeight, radii, semanticColors, spacing } from "../tokens.stylex";

export const Route = createFileRoute("/")({
	component: HomePage,
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
	welcomeWrapper: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		minHeight: "80vh",
	},
	welcomeContent: {
		textAlign: "center",
		maxWidth: "24rem",
		paddingLeft: spacing["2xl"],
		paddingRight: spacing["2xl"],
	},
	welcomeIcon: {
		width: "4.5rem",
		height: "4.5rem",
		borderRadius: "1.25rem",
		backgroundImage: `linear-gradient(135deg, ${colors.indigo500}, ${colors.purple600})`,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginLeft: "auto",
		marginRight: "auto",
		marginBottom: spacing["2xl"],
		boxShadow: "0 12px 28px -6px rgba(99, 102, 241, 0.3)",
	},
	welcomeTitle: {
		fontSize: fontSize["2xl"],
		fontWeight: fontWeight.bold,
		color: semanticColors.textPrimary,
		marginBottom: spacing.sm,
		letterSpacing: "-0.025em",
	},
	welcomeText: {
		color: semanticColors.textSecondary,
		marginBottom: spacing["3xl"],
		fontSize: fontSize.sm,
		lineHeight: "1.6",
	},
	welcomeButton: {
		display: "inline-flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingLeft: spacing["2xl"],
		paddingRight: spacing["2xl"],
		paddingTop: "0.75rem",
		paddingBottom: "0.75rem",
		fontSize: fontSize.sm,
		backgroundImage: `linear-gradient(135deg, ${colors.indigo500}, ${colors.blue600})`,
		color: colors.white,
		borderRadius: radii.xl,
		fontWeight: fontWeight.semibold,
		textDecoration: "none",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		boxShadow: "0 4px 14px -2px rgba(99, 102, 241, 0.3)",
		":hover": {
			boxShadow: "0 8px 20px -2px rgba(99, 102, 241, 0.4)",
			transform: "translateY(-1px)",
		},
	},
	pageHeader: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
		marginBottom: spacing["2xl"],
	},
	pageHeaderIcon: {
		width: "2.25rem",
		height: "2.25rem",
		borderRadius: radii.lg,
		backgroundImage: `linear-gradient(135deg, ${colors.indigo500}, ${colors.purple600})`,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		boxShadow: "0 4px 12px -2px rgba(99, 102, 241, 0.25)",
	},
	pageTitle: {
		fontSize: fontSize.xl,
		fontWeight: fontWeight.bold,
		color: semanticColors.textPrimary,
		letterSpacing: "-0.025em",
	},
	pageSubtitle: {
		fontSize: fontSize.xs,
		color: semanticColors.textSecondary,
	},
	formWrapper: {
		marginBottom: spacing["2xl"],
	},
	postsList: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.md,
	},
	iconWhite: {
		color: colors.white,
	},
});

function HomePage() {
	const [posts, setPosts] = useState<any[]>([]);
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const [currentUser, feedPosts] = await Promise.all([
				getCurrentUser(),
				getHomeFeed({ data: {} }),
			]);
			setUser(currentUser);
			setPosts(feedPosts);
		} catch (error) {
			console.error("Failed to load data:", error);
		} finally {
			setLoading(false);
		}
	};

	if (!user && !loading) {
		return (
			<div {...stylex.props(styles.welcomeWrapper)}>
				<div {...stylex.props(styles.welcomeContent)}>
					<div {...stylex.props(styles.welcomeIcon)}>
						<MessageCircle size={40} {...stylex.props(styles.iconWhite)} />
					</div>
					<h2 {...stylex.props(styles.welcomeTitle)}>Welcome to Chirp</h2>
					<p {...stylex.props(styles.welcomeText)}>
						Please log in to view your personalized feed and connect with others.
					</p>
					<Link to="/auth/login" {...stylex.props(styles.welcomeButton)}>
						Log In
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			{/* Page Header */}
			<div {...stylex.props(styles.pageHeader)}>
				<div {...stylex.props(styles.pageHeaderIcon)}>
					<Sparkles size={20} {...stylex.props(styles.iconWhite)} />
				</div>
				<div>
					<h1 {...stylex.props(styles.pageTitle)}>Home</h1>
					<p {...stylex.props(styles.pageSubtitle)}>Your personalized feed</p>
				</div>
			</div>

			{/* Post Form */}
			{user && (
				<div {...stylex.props(styles.formWrapper)}>
					<PostForm onSuccess={loadData} />
				</div>
			)}

			{/* Posts */}
			<div {...stylex.props(styles.postsList)}>
				<PostList
					posts={posts}
					loading={loading}
					currentUserId={user?.id}
					onPostDelete={loadData}
				/>
			</div>
		</div>
	);
}
