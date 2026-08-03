import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Flag, Heart, MessageSquare, Search, Trash2, User } from "lucide-react";
import { requireAdminAccess } from "../../lib/auth-guard";
import { colors, radii, semanticColors, spacing } from "../../tokens.stylex";

const styles = stylex.create({
	container: {
		maxWidth: "1400px",
		marginInline: "auto",
		paddingInline: spacing.lg,
		paddingBlock: spacing.xl,
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: spacing.xl,
	},
	title: {
		fontSize: "1.875rem",
		fontWeight: 700,
		color: semanticColors.textPrimary,
	},
	filters: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
	},
	searchContainer: {
		position: "relative",
		width: "300px",
	},
	searchIcon: {
		position: "absolute",
		left: spacing.md,
		top: "50%",
		transform: "translateY(-50%)",
		color: semanticColors.textTertiary,
	},
	searchInput: {
		width: "100%",
		paddingBlock: spacing.sm,
		paddingLeft: "40px",
		paddingRight: spacing.md,
		borderRadius: radii.md,
		border: `1px solid ${semanticColors.borderDefault}`,
		backgroundColor: semanticColors.surfaceInput,
		color: semanticColors.textPrimary,
		fontSize: "0.875rem",
		"::placeholder": {
			color: semanticColors.textTertiary,
		},
		":focus": {
			outline: "none",
			borderColor: semanticColors.borderFocus,
		},
	},
	filterSelect: {
		paddingBlock: spacing.sm,
		paddingInline: spacing.md,
		borderRadius: radii.md,
		border: `1px solid ${semanticColors.borderDefault}`,
		backgroundColor: semanticColors.surfaceInput,
		color: semanticColors.textPrimary,
		fontSize: "0.875rem",
		cursor: "pointer",
	},
	postsList: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.md,
	},
	postCard: {
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.lg,
		border: `1px solid ${semanticColors.borderSubtle}`,
		padding: spacing.lg,
	},
	postHeader: {
		display: "flex",
		alignItems: "flex-start",
		justifyContent: "space-between",
		marginBottom: spacing.md,
	},
	authorSection: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
	},
	avatar: {
		width: "40px",
		height: "40px",
		borderRadius: "50%",
		backgroundColor: semanticColors.bgSecondary,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: semanticColors.textTertiary,
	},
	authorInfo: {
		display: "flex",
		flexDirection: "column",
	},
	authorName: {
		color: semanticColors.textPrimary,
		fontWeight: 500,
		fontSize: "0.875rem",
	},
	authorHandle: {
		color: semanticColors.textTertiary,
		fontSize: "0.75rem",
	},
	postActions: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
	},
	actionButton: {
		padding: spacing.sm,
		borderRadius: radii.md,
		border: "none",
		backgroundColor: "transparent",
		color: semanticColors.textTertiary,
		cursor: "pointer",
		":hover": {
			backgroundColor: semanticColors.bgHover,
			color: semanticColors.textPrimary,
		},
	},
	deleteButton: {
		":hover": {
			backgroundColor: colors.red900,
			color: colors.red400,
		},
	},
	postContent: {
		color: semanticColors.textSecondary,
		fontSize: "0.9375rem",
		lineHeight: 1.6,
		marginBottom: spacing.md,
	},
	postFooter: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
	},
	postStats: {
		display: "flex",
		alignItems: "center",
		gap: spacing.lg,
	},
	stat: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		color: semanticColors.textTertiary,
		fontSize: "0.875rem",
	},
	postTime: {
		color: semanticColors.textTertiary,
		fontSize: "0.75rem",
	},
	flagged: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		color: colors.yellow500,
		fontSize: "0.75rem",
	},
});

export const Route = createFileRoute("/posts/")({
	beforeLoad: requireAdminAccess,
	component: PostsPage,
});

const mockPosts = [
	{
		id: "1",
		author: { id: "1", username: "alice", displayName: "Alice Johnson" },
		content:
			"Just deployed my first full-stack app with gRPC and TypeScript. The type safety across the entire stack is incredible!",
		likes: 3,
		comments: 2,
		reports: 0,
		createdAt: "30 minutes ago",
	},
	{
		id: "2",
		author: { id: "2", username: "bob", displayName: "Bob Smith" },
		content:
			"Morning coffee and code reviews. There is something peaceful about reading clean, well-structured code early in the day.",
		likes: 2,
		comments: 1,
		reports: 0,
		createdAt: "1 hour ago",
	},
	{
		id: "3",
		author: { id: "1", username: "alice", displayName: "Alice Johnson" },
		content:
			"Hot take: monorepos are the way to go for any team project. Shared packages, consistent tooling, and atomic changes across services.",
		likes: 2,
		comments: 1,
		reports: 0,
		createdAt: "2 hours ago",
	},
	{
		id: "4",
		author: { id: "3", username: "charlie", displayName: "Charlie Brown" },
		content:
			"Finally wrapped my head around Protocol Buffers. The schema-first approach to API design changes everything.",
		likes: 2,
		comments: 1,
		reports: 0,
		createdAt: "3 hours ago",
	},
	{
		id: "5",
		author: { id: "4", username: "diana", displayName: "Diana Ross" },
		content: "Spent the weekend learning StyleX. CSS-in-JS with zero runtime cost? Sign me up.",
		likes: 2,
		comments: 1,
		reports: 0,
		createdAt: "5 hours ago",
	},
];

function PostsPage() {
	return (
		<main {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<h1 {...stylex.props(styles.title)}>Posts</h1>
				<div {...stylex.props(styles.filters)}>
					<select {...stylex.props(styles.filterSelect)}>
						<option value="all">All Posts</option>
						<option value="reported">Reported Only</option>
						<option value="recent">Most Recent</option>
					</select>
					<div {...stylex.props(styles.searchContainer)}>
						<Search size={16} {...stylex.props(styles.searchIcon)} />
						<input
							type="text"
							placeholder="Search posts..."
							{...stylex.props(styles.searchInput)}
						/>
					</div>
				</div>
			</header>

			<div {...stylex.props(styles.postsList)}>
				{mockPosts.map((post) => (
					<article key={post.id} {...stylex.props(styles.postCard)}>
						<div {...stylex.props(styles.postHeader)}>
							<div {...stylex.props(styles.authorSection)}>
								<div {...stylex.props(styles.avatar)}>
									<User size={20} />
								</div>
								<div {...stylex.props(styles.authorInfo)}>
									<Link
										to="/users/$userId"
										params={{ userId: post.author.id }}
										{...stylex.props(styles.authorName)}
									>
										{post.author.displayName}
									</Link>
									<span {...stylex.props(styles.authorHandle)}>@{post.author.username}</span>
								</div>
							</div>
							<div {...stylex.props(styles.postActions)}>
								<Link
									to="/posts/$postId"
									params={{ postId: post.id }}
									{...stylex.props(styles.actionButton)}
								>
									<Eye size={16} />
								</Link>
								<button type="button" {...stylex.props(styles.actionButton, styles.deleteButton)}>
									<Trash2 size={16} />
								</button>
							</div>
						</div>

						<p {...stylex.props(styles.postContent)}>{post.content}</p>

						<div {...stylex.props(styles.postFooter)}>
							<div {...stylex.props(styles.postStats)}>
								<span {...stylex.props(styles.stat)}>
									<Heart size={14} /> {post.likes}
								</span>
								<span {...stylex.props(styles.stat)}>
									<MessageSquare size={14} /> {post.comments}
								</span>
								{post.reports > 0 && (
									<span {...stylex.props(styles.flagged)}>
										<Flag size={14} /> {post.reports} reports
									</span>
								)}
							</div>
							<span {...stylex.props(styles.postTime)}>{post.createdAt}</span>
						</div>
					</article>
				))}
			</div>
		</main>
	);
}
