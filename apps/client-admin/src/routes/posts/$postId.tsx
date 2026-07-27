import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Heart, MessageSquare, Trash2, User } from "lucide-react";
import { requireAdminAccess } from "../../lib/auth-guard";
import { colors, radii, spacing } from "../../tokens.stylex";

const styles = stylex.create({
	container: {
		maxWidth: "1000px",
		marginInline: "auto",
		paddingInline: spacing.lg,
		paddingBlock: spacing.xl,
	},
	backLink: {
		display: "inline-flex",
		alignItems: "center",
		gap: spacing.sm,
		color: colors.slate400,
		textDecoration: "none",
		fontSize: "0.875rem",
		marginBottom: spacing.lg,
		":hover": {
			color: colors.white,
		},
	},
	card: {
		backgroundColor: colors.slate800,
		borderRadius: radii.lg,
		border: `1px solid ${colors.slate700}`,
		overflow: "hidden",
		marginBottom: spacing.lg,
	},
	cardHeader: {
		padding: spacing.lg,
		borderBottom: `1px solid ${colors.slate700}`,
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
	},
	cardTitle: {
		fontSize: "1.125rem",
		fontWeight: 600,
		color: colors.white,
	},
	cardContent: {
		padding: spacing.lg,
	},
	authorSection: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
		marginBottom: spacing.lg,
	},
	avatar: {
		width: "48px",
		height: "48px",
		borderRadius: "50%",
		backgroundColor: colors.slate700,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: colors.slate400,
	},
	authorInfo: {
		display: "flex",
		flexDirection: "column",
	},
	authorName: {
		color: colors.white,
		fontWeight: 500,
		textDecoration: "none",
		":hover": {
			textDecoration: "underline",
		},
	},
	authorHandle: {
		color: colors.slate500,
		fontSize: "0.875rem",
	},
	postContent: {
		color: colors.slate200,
		fontSize: "1.125rem",
		lineHeight: 1.7,
		marginBottom: spacing.lg,
	},
	postMeta: {
		display: "flex",
		alignItems: "center",
		gap: spacing.lg,
		paddingTop: spacing.md,
		borderTop: `1px solid ${colors.slate700}`,
	},
	metaItem: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		color: colors.slate400,
		fontSize: "0.875rem",
	},
	deleteButton: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingInline: spacing.md,
		paddingBlock: spacing.sm,
		borderRadius: radii.md,
		border: "none",
		backgroundColor: colors.red600,
		color: colors.white,
		fontSize: "0.875rem",
		fontWeight: 500,
		cursor: "pointer",
		":hover": {
			backgroundColor: colors.red700,
		},
	},
	reportsSection: {
		marginTop: spacing.lg,
	},
	reportItem: {
		padding: spacing.md,
		borderBottom: `1px solid ${colors.slate700}`,
	},
	reportItemLast: {
		borderBottom: "none",
	},
	reportHeader: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: spacing.sm,
	},
	reportReason: {
		color: colors.white,
		fontWeight: 500,
		fontSize: "0.875rem",
	},
	reportTime: {
		color: colors.slate500,
		fontSize: "0.75rem",
	},
	reportUser: {
		color: colors.slate400,
		fontSize: "0.875rem",
	},
	emptyState: {
		textAlign: "center",
		color: colors.slate400,
		paddingBlock: spacing.lg,
	},
	commentsSection: {
		marginTop: spacing.lg,
	},
	comment: {
		padding: spacing.md,
		borderBottom: `1px solid ${colors.slate700}`,
	},
	commentLast: {
		borderBottom: "none",
	},
	commentHeader: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		marginBottom: spacing.sm,
	},
	commentAvatar: {
		width: "24px",
		height: "24px",
		borderRadius: "50%",
		backgroundColor: colors.slate700,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: colors.slate400,
	},
	commentAuthor: {
		color: colors.white,
		fontWeight: 500,
		fontSize: "0.875rem",
	},
	commentTime: {
		color: colors.slate500,
		fontSize: "0.75rem",
	},
	commentContent: {
		color: colors.slate300,
		fontSize: "0.875rem",
	},
});

export const Route = createFileRoute("/posts/$postId")({
	beforeLoad: requireAdminAccess,
	component: PostDetailPage,
});

// Mock data - will be replaced with gRPC calls
const mockPost = {
	id: "1",
	author: { id: "1", username: "johndoe", displayName: "John Doe" },
	content:
		"Just finished building a new feature! Excited to share it with everyone. This is going to revolutionize how we work. The team has been working really hard on this and I cannot wait for everyone to try it out.",
	likes: 24,
	comments: 8,
	createdAt: "2024-01-15 14:30",
};

const mockReports = [
	{ id: "1", reason: "Spam", reporter: "@user123", createdAt: "1 hour ago" },
	{ id: "2", reason: "Misleading content", reporter: "@alice", createdAt: "3 hours ago" },
];

const mockComments = [
	{
		id: "1",
		author: { username: "alice", displayName: "Alice" },
		content: "Great work!",
		createdAt: "1 hour ago",
	},
	{
		id: "2",
		author: { username: "bob", displayName: "Bob" },
		content: "Looking forward to trying this out!",
		createdAt: "2 hours ago",
	},
];

function PostDetailPage() {
	const { postId: _postId } = Route.useParams();

	return (
		<main {...stylex.props(styles.container)}>
			<Link to="/posts" {...stylex.props(styles.backLink)}>
				<ArrowLeft size={16} />
				Back to Posts
			</Link>

			<div {...stylex.props(styles.card)}>
				<div {...stylex.props(styles.cardHeader)}>
					<h1 {...stylex.props(styles.cardTitle)}>Post Details</h1>
					<button type="button" {...stylex.props(styles.deleteButton)}>
						<Trash2 size={16} />
						Delete Post
					</button>
				</div>
				<div {...stylex.props(styles.cardContent)}>
					<div {...stylex.props(styles.authorSection)}>
						<div {...stylex.props(styles.avatar)}>
							<User size={24} />
						</div>
						<div {...stylex.props(styles.authorInfo)}>
							<Link
								to="/users/$userId"
								params={{ userId: mockPost.author.id }}
								{...stylex.props(styles.authorName)}
							>
								{mockPost.author.displayName}
							</Link>
							<span {...stylex.props(styles.authorHandle)}>@{mockPost.author.username}</span>
						</div>
					</div>

					<p {...stylex.props(styles.postContent)}>{mockPost.content}</p>

					<div {...stylex.props(styles.postMeta)}>
						<span {...stylex.props(styles.metaItem)}>
							<Heart size={14} /> {mockPost.likes} likes
						</span>
						<span {...stylex.props(styles.metaItem)}>
							<MessageSquare size={14} /> {mockPost.comments} comments
						</span>
						<span {...stylex.props(styles.metaItem)}>
							<Calendar size={14} /> {mockPost.createdAt}
						</span>
					</div>
				</div>
			</div>

			<div {...stylex.props(styles.card)}>
				<div {...stylex.props(styles.cardHeader)}>
					<h2 {...stylex.props(styles.cardTitle)}>Reports ({mockReports.length})</h2>
				</div>
				<div>
					{mockReports.length === 0 ? (
						<p {...stylex.props(styles.emptyState)}>No reports for this post</p>
					) : (
						mockReports.map((report, index) => {
							const isLast = index === mockReports.length - 1;
							return (
								<div
									key={report.id}
									{...stylex.props(styles.reportItem, isLast && styles.reportItemLast)}
								>
									<div {...stylex.props(styles.reportHeader)}>
										<span {...stylex.props(styles.reportReason)}>{report.reason}</span>
										<span {...stylex.props(styles.reportTime)}>{report.createdAt}</span>
									</div>
									<span {...stylex.props(styles.reportUser)}>Reported by {report.reporter}</span>
								</div>
							);
						})
					)}
				</div>
			</div>

			<div {...stylex.props(styles.card)}>
				<div {...stylex.props(styles.cardHeader)}>
					<h2 {...stylex.props(styles.cardTitle)}>Comments ({mockComments.length})</h2>
				</div>
				<div>
					{mockComments.length === 0 ? (
						<p {...stylex.props(styles.emptyState)}>No comments on this post</p>
					) : (
						mockComments.map((comment, index) => {
							const isLast = index === mockComments.length - 1;
							return (
								<div
									key={comment.id}
									{...stylex.props(styles.comment, isLast && styles.commentLast)}
								>
									<div {...stylex.props(styles.commentHeader)}>
										<div {...stylex.props(styles.commentAvatar)}>
											<User size={12} />
										</div>
										<span {...stylex.props(styles.commentAuthor)}>
											{comment.author.displayName}
										</span>
										<span {...stylex.props(styles.commentTime)}>{comment.createdAt}</span>
									</div>
									<p {...stylex.props(styles.commentContent)}>{comment.content}</p>
								</div>
							);
						})
					)}
				</div>
			</div>
		</main>
	);
}
