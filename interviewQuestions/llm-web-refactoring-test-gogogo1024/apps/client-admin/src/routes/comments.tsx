import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Eye, Flag, Search, Trash2, User } from "lucide-react";
import { requireAdminAccess } from "../lib/auth-guard";
import { colors, radii, semanticColors, spacing } from "../tokens.stylex";

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
	table: {
		width: "100%",
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.lg,
		border: `1px solid ${semanticColors.borderSubtle}`,
		overflow: "hidden",
	},
	tableHeader: {
		backgroundColor: semanticColors.bgSecondary,
	},
	tableRow: {
		borderBottom: `1px solid ${semanticColors.borderSubtle}`,
		":hover": {
			backgroundColor: semanticColors.bgHover,
		},
	},
	tableRowLast: {
		borderBottom: "none",
	},
	th: {
		textAlign: "left",
		padding: spacing.md,
		color: semanticColors.textTertiary,
		fontSize: "0.75rem",
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
	},
	td: {
		padding: spacing.md,
		color: semanticColors.textSecondary,
		fontSize: "0.875rem",
	},
	userCell: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
	},
	avatar: {
		width: "32px",
		height: "32px",
		borderRadius: "50%",
		backgroundColor: semanticColors.bgSecondary,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: semanticColors.textTertiary,
	},
	userName: {
		color: semanticColors.textPrimary,
		fontWeight: 500,
		textDecoration: "none",
		":hover": {
			textDecoration: "underline",
		},
	},
	commentContent: {
		maxWidth: "400px",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	postLink: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		color: colors.blue400,
		textDecoration: "none",
		fontSize: "0.875rem",
		":hover": {
			textDecoration: "underline",
		},
	},
	flagged: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		color: colors.yellow500,
	},
	actionsCell: {
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
});

export const Route = createFileRoute("/comments")({
	beforeLoad: requireAdminAccess,
	component: CommentsPage,
});

const mockComments = [
	{
		id: "1",
		author: { id: "2", username: "bob", displayName: "Bob Smith" },
		content: "Congrats on the deployment! What was the trickiest part of the gRPC setup?",
		postId: "1",
		postTitle: "Just deployed my first...",
		reports: 0,
		createdAt: "25 minutes ago",
	},
	{
		id: "2",
		author: { id: "3", username: "charlie", displayName: "Charlie Brown" },
		content: "The type safety with Protobuf + TypeScript is next level. Welcome to the club!",
		postId: "1",
		postTitle: "Just deployed my first...",
		reports: 0,
		createdAt: "20 minutes ago",
	},
	{
		id: "3",
		author: { id: "1", username: "alice", displayName: "Alice Johnson" },
		content: "Could not agree more. A good codebase is a joy to read.",
		postId: "2",
		postTitle: "Morning coffee and code...",
		reports: 0,
		createdAt: "45 minutes ago",
	},
	{
		id: "4",
		author: { id: "4", username: "diana", displayName: "Diana Ross" },
		content: "Totally agree! We switched to a monorepo last year and never looked back.",
		postId: "3",
		postTitle: "Hot take: monorepos are...",
		reports: 0,
		createdAt: "1 hour ago",
	},
	{
		id: "5",
		author: { id: "1", username: "alice", displayName: "Alice Johnson" },
		content: "Check out Buf for linting and managing your proto files. It is a huge time saver.",
		postId: "4",
		postTitle: "Finally wrapped my head...",
		reports: 0,
		createdAt: "2 hours ago",
	},
];

function CommentsPage() {
	return (
		<main {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<h1 {...stylex.props(styles.title)}>Comments</h1>
				<div {...stylex.props(styles.filters)}>
					<select {...stylex.props(styles.filterSelect)}>
						<option value="all">All Comments</option>
						<option value="reported">Reported Only</option>
						<option value="recent">Most Recent</option>
					</select>
					<div {...stylex.props(styles.searchContainer)}>
						<Search size={16} {...stylex.props(styles.searchIcon)} />
						<input
							type="text"
							placeholder="Search comments..."
							{...stylex.props(styles.searchInput)}
						/>
					</div>
				</div>
			</header>

			<table {...stylex.props(styles.table)}>
				<thead {...stylex.props(styles.tableHeader)}>
					<tr>
						<th {...stylex.props(styles.th)}>Author</th>
						<th {...stylex.props(styles.th)}>Comment</th>
						<th {...stylex.props(styles.th)}>Post</th>
						<th {...stylex.props(styles.th)}>Reports</th>
						<th {...stylex.props(styles.th)}>Date</th>
						<th {...stylex.props(styles.th)}>Actions</th>
					</tr>
				</thead>
				<tbody>
					{mockComments.map((comment, index) => {
						const isLast = index === mockComments.length - 1;
						return (
							<tr
								key={comment.id}
								{...stylex.props(styles.tableRow, isLast && styles.tableRowLast)}
							>
								<td {...stylex.props(styles.td)}>
									<div {...stylex.props(styles.userCell)}>
										<div {...stylex.props(styles.avatar)}>
											<User size={16} />
										</div>
										<Link
											to="/users/$userId"
											params={{ userId: comment.author.id }}
											{...stylex.props(styles.userName)}
										>
											{comment.author.displayName}
										</Link>
									</div>
								</td>
								<td {...stylex.props(styles.td)}>
									<span {...stylex.props(styles.commentContent)}>{comment.content}</span>
								</td>
								<td {...stylex.props(styles.td)}>
									<Link
										to="/posts/$postId"
										params={{ postId: comment.postId }}
										{...stylex.props(styles.postLink)}
									>
										{comment.postTitle}
										<ExternalLink size={12} />
									</Link>
								</td>
								<td {...stylex.props(styles.td)}>
									{comment.reports > 0 ? (
										<span {...stylex.props(styles.flagged)}>
											<Flag size={14} /> {comment.reports}
										</span>
									) : (
										"-"
									)}
								</td>
								<td {...stylex.props(styles.td)}>{comment.createdAt}</td>
								<td {...stylex.props(styles.td)}>
									<div {...stylex.props(styles.actionsCell)}>
										<button type="button" {...stylex.props(styles.actionButton)}>
											<Eye size={16} />
										</button>
										<button
											type="button"
											{...stylex.props(styles.actionButton, styles.deleteButton)}
										>
											<Trash2 size={16} />
										</button>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</main>
	);
}
