import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Search, SearchX, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { PostList } from "../components/posts/PostList";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { UserAvatar } from "../components/users/UserAvatar";
import { getCurrentUser } from "../server/functions/auth";
import { searchPosts, searchUsers } from "../server/functions/search";
import {
	colors,
	fontSize,
	fontWeight,
	radii,
	semanticColors,
	shadows,
	spacing,
} from "../tokens.stylex";

export const Route = createFileRoute("/search")({
	component: SearchPage,
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
		backgroundImage: `linear-gradient(135deg, ${colors.amber500}, ${colors.orange500})`,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		boxShadow: "0 4px 12px -2px rgba(245, 158, 11, 0.25)",
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
	searchCard: {
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.xl,
		boxShadow: shadows.card,
		padding: spacing.xl,
		marginBottom: spacing["2xl"],
	},
	searchRow: {
		display: "flex",
		gap: spacing.md,
	},
	searchInputWrapper: {
		flex: 1,
		position: "relative",
	},
	searchInputIcon: {
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		paddingLeft: spacing.md,
		display: "flex",
		alignItems: "center",
		pointerEvents: "none",
	},
	searchInput: {
		width: "100%",
		paddingLeft: "2.75rem",
		paddingRight: spacing.lg,
		paddingTop: "0.625rem",
		paddingBottom: "0.625rem",
		border: `1.5px solid ${semanticColors.borderSubtle}`,
		borderRadius: radii.lg,
		fontSize: fontSize.sm,
		outline: "none",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		boxSizing: "border-box",
		backgroundColor: semanticColors.surfaceInput,
		":focus": {
			borderColor: colors.indigo500,
			boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
			backgroundColor: semanticColors.surfaceCard,
		},
	},
	searchButton: {
		paddingLeft: spacing["2xl"],
		paddingRight: spacing["2xl"],
		paddingTop: "0.625rem",
		paddingBottom: "0.625rem",
		backgroundImage: `linear-gradient(135deg, ${colors.indigo500}, ${colors.blue600})`,
		color: colors.white,
		borderRadius: radii.lg,
		fontWeight: fontWeight.semibold,
		fontSize: fontSize.sm,
		border: "none",
		cursor: "pointer",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		boxShadow: "0 4px 14px -2px rgba(99, 102, 241, 0.25)",
		":hover": {
			boxShadow: "0 8px 20px -2px rgba(99, 102, 241, 0.35)",
			transform: "translateY(-1px)",
		},
	},
	tabs: {
		display: "flex",
		gap: spacing.sm,
		marginTop: spacing.lg,
	},
	tab: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingLeft: spacing.lg,
		paddingRight: spacing.lg,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderRadius: radii.lg,
		fontWeight: fontWeight.medium,
		fontSize: fontSize.sm,
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		border: "none",
		cursor: "pointer",
	},
	tabActive: {
		backgroundColor: semanticColors.primaryLight,
		color: colors.indigo500,
	},
	tabInactive: {
		backgroundColor: semanticColors.bgSecondary,
		color: semanticColors.textSecondary,
		":hover": {
			backgroundColor: semanticColors.bgHover,
			color: semanticColors.textPrimary,
		},
	},
	loadingWrapper: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: spacing["5xl"],
		paddingBottom: spacing["5xl"],
	},
	emptyCard: {
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.xl,
		boxShadow: shadows.card,
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
		fontSize: fontSize.base,
		fontWeight: fontWeight.semibold,
		color: semanticColors.textPrimary,
		marginBottom: spacing.xs,
	},
	emptyText: {
		color: semanticColors.textSecondary,
		fontSize: fontSize.sm,
	},
	usersList: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
	},
	userCard: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
		padding: spacing.lg,
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.xl,
		boxShadow: shadows.card,
		textDecoration: "none",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		":hover": {
			boxShadow: shadows.cardHover,
			transform: "translateY(-1px)",
		},
	},
	userInfo: {
		flex: 1,
		minWidth: 0,
	},
	userName: {
		fontWeight: fontWeight.semibold,
		color: semanticColors.textPrimary,
		fontSize: fontSize.sm,
	},
	userHandle: {
		fontSize: fontSize.xs,
		color: semanticColors.textSecondary,
	},
	userBio: {
		fontSize: fontSize.xs,
		color: semanticColors.textSecondary,
		marginTop: spacing.xs,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	iconGray: {
		color: semanticColors.textTertiary,
	},
	iconWhite: {
		color: colors.white,
	},
});

function SearchPage() {
	const [query, setQuery] = useState("");
	const [posts, setPosts] = useState<any[]>([]);
	const [users, setUsers] = useState<any[]>([]);
	const [user, setUser] = useState<any>(null);
	const [tab, setTab] = useState<"posts" | "users">("posts");
	const [loading, setLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);

	useEffect(() => {
		getCurrentUser().then(setUser);
	}, []);

	const handleSearch = async () => {
		if (!query.trim()) return;

		setLoading(true);
		setHasSearched(true);
		try {
			const [postsResults, usersResults] = await Promise.all([
				searchPosts({ data: query }),
				searchUsers({ data: query }),
			]);
			setPosts(postsResults);
			setUsers(usersResults);
		} catch (error) {
			console.error("Search failed:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div {...stylex.props(styles.container)}>
			{/* Page Header */}
			<div {...stylex.props(styles.pageHeader)}>
				<div {...stylex.props(styles.pageHeaderIcon)}>
					<Search size={20} {...stylex.props(styles.iconWhite)} />
				</div>
				<div>
					<h1 {...stylex.props(styles.pageTitle)}>Search</h1>
					<p {...stylex.props(styles.pageSubtitle)}>Find posts and people</p>
				</div>
			</div>

			{/* Search Box */}
			<div {...stylex.props(styles.searchCard)}>
				<div {...stylex.props(styles.searchRow)}>
					<div {...stylex.props(styles.searchInputWrapper)}>
						<div {...stylex.props(styles.searchInputIcon)}>
							<Search size={20} {...stylex.props(styles.iconGray)} />
						</div>
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSearch()}
							placeholder="Search Chirp..."
							{...stylex.props(styles.searchInput)}
						/>
					</div>
					<button type="button" onClick={handleSearch} {...stylex.props(styles.searchButton)}>
						Search
					</button>
				</div>

				{/* Tabs */}
				<div {...stylex.props(styles.tabs)}>
					<button
						type="button"
						onClick={() => setTab("posts")}
						{...stylex.props(styles.tab, tab === "posts" ? styles.tabActive : styles.tabInactive)}
					>
						<FileText size={20} />
						Posts
					</button>
					<button
						type="button"
						onClick={() => setTab("users")}
						{...stylex.props(styles.tab, tab === "users" ? styles.tabActive : styles.tabInactive)}
					>
						<Users size={20} />
						Users
					</button>
				</div>
			</div>

			{/* Results */}
			{loading ? (
				<div {...stylex.props(styles.loadingWrapper)}>
					<LoadingSpinner size="lg" />
				</div>
			) : !hasSearched ? (
				<div {...stylex.props(styles.emptyCard)}>
					<div {...stylex.props(styles.emptyIcon)}>
						<Search size={32} {...stylex.props(styles.iconGray)} />
					</div>
					<h3 {...stylex.props(styles.emptyTitle)}>Start searching</h3>
					<p {...stylex.props(styles.emptyText)}>Enter a query to find posts or users</p>
				</div>
			) : tab === "posts" ? (
				posts.length === 0 ? (
					<div {...stylex.props(styles.emptyCard)}>
						<div {...stylex.props(styles.emptyIcon)}>
							<SearchX size={32} {...stylex.props(styles.iconGray)} />
						</div>
						<h3 {...stylex.props(styles.emptyTitle)}>No posts found</h3>
						<p {...stylex.props(styles.emptyText)}>Try a different search term</p>
					</div>
				) : (
					<PostList posts={posts} currentUserId={user?.id} />
				)
			) : users.length === 0 ? (
				<div {...stylex.props(styles.emptyCard)}>
					<div {...stylex.props(styles.emptyIcon)}>
						<SearchX size={32} {...stylex.props(styles.iconGray)} />
					</div>
					<h3 {...stylex.props(styles.emptyTitle)}>No users found</h3>
					<p {...stylex.props(styles.emptyText)}>Try a different search term</p>
				</div>
			) : (
				<div {...stylex.props(styles.usersList)}>
					{users.map((u) => (
						<Link
							key={u.id}
							to="/users/$username"
							params={{ username: u.username }}
							{...stylex.props(styles.userCard)}
						>
							<UserAvatar avatarUrl={u.avatarUrl} username={u.username} />
							<div {...stylex.props(styles.userInfo)}>
								<p {...stylex.props(styles.userName)}>{u.displayName}</p>
								<p {...stylex.props(styles.userHandle)}>@{u.username}</p>
								{u.bio && <p {...stylex.props(styles.userBio)}>{u.bio}</p>}
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
