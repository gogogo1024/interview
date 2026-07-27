import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Ban,
	Calendar,
	Check,
	FileText,
	Filter,
	MessageSquare,
	Search,
	Shield,
	Trash2,
	User,
} from "lucide-react";
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
	filterButton: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingInline: spacing.md,
		paddingBlock: spacing.sm,
		borderRadius: radii.md,
		border: `1px solid ${semanticColors.borderDefault}`,
		backgroundColor: semanticColors.surfaceInput,
		color: semanticColors.textSecondary,
		fontSize: "0.875rem",
		cursor: "pointer",
		":hover": {
			backgroundColor: semanticColors.bgHover,
		},
	},
	timeline: {
		position: "relative",
		paddingLeft: "32px",
	},
	timelineLine: {
		position: "absolute",
		left: "11px",
		top: 0,
		bottom: 0,
		width: "2px",
		backgroundColor: semanticColors.borderSubtle,
	},
	logEntry: {
		position: "relative",
		marginBottom: spacing.lg,
	},
	logEntryLast: {
		marginBottom: 0,
	},
	logIcon: {
		position: "absolute",
		left: "-32px",
		width: "24px",
		height: "24px",
		borderRadius: "50%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: semanticColors.surfaceCard,
		border: `2px solid ${semanticColors.borderSubtle}`,
	},
	logIconBan: {
		backgroundColor: colors.red900,
		borderColor: colors.red700,
		color: colors.red400,
	},
	logIconDelete: {
		backgroundColor: colors.red900,
		borderColor: colors.red700,
		color: colors.red400,
	},
	logIconRole: {
		backgroundColor: "#581c87",
		borderColor: "#7c3aed",
		color: "#c084fc",
	},
	logIconResolve: {
		backgroundColor: colors.green900,
		borderColor: colors.green700,
		color: colors.green400,
	},
	logIconDefault: {
		backgroundColor: semanticColors.surfaceCard,
		borderColor: semanticColors.borderDefault,
		color: semanticColors.textTertiary,
	},
	logCard: {
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.lg,
		border: `1px solid ${semanticColors.borderSubtle}`,
		padding: spacing.md,
	},
	logHeader: {
		display: "flex",
		alignItems: "flex-start",
		justifyContent: "space-between",
		marginBottom: spacing.sm,
	},
	logAction: {
		color: semanticColors.textPrimary,
		fontWeight: 500,
		fontSize: "0.9375rem",
	},
	logTime: {
		color: semanticColors.textTertiary,
		fontSize: "0.75rem",
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
	},
	logDescription: {
		color: semanticColors.textTertiary,
		fontSize: "0.875rem",
		marginBottom: spacing.md,
	},
	logMeta: {
		display: "flex",
		alignItems: "center",
		gap: spacing.lg,
		paddingTop: spacing.sm,
		borderTop: `1px solid ${semanticColors.borderSubtle}`,
	},
	logMetaItem: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		color: semanticColors.textTertiary,
		fontSize: "0.75rem",
	},
	adminLink: {
		color: colors.blue400,
		textDecoration: "none",
		":hover": {
			textDecoration: "underline",
		},
	},
	targetLink: {
		color: semanticColors.textSecondary,
		textDecoration: "none",
		":hover": {
			textDecoration: "underline",
		},
	},
	dateHeader: {
		color: semanticColors.textTertiary,
		fontSize: "0.875rem",
		fontWeight: 600,
		marginBottom: spacing.md,
		marginTop: spacing.xl,
	},
	dateHeaderFirst: {
		marginTop: 0,
	},
});

export const Route = createFileRoute("/audit")({
	beforeLoad: requireAdminAccess,
	component: AuditPage,
});

type AuditAction =
	| "ban_user"
	| "unban_user"
	| "delete_post"
	| "delete_comment"
	| "change_role"
	| "resolve_report";

const mockAuditLogs = [
	{
		id: "1",
		adminId: "1",
		adminUsername: "admin",
		action: "change_role" as AuditAction,
		targetType: "user",
		targetId: "6",
		targetName: "@moderator",
		details: "Assigned moderator role during platform setup",
		createdAt: "1 hour ago",
		date: "Today",
	},
	{
		id: "2",
		adminId: "1",
		adminUsername: "admin",
		action: "change_role" as AuditAction,
		targetType: "user",
		targetId: "5",
		targetName: "@admin",
		details: "Initial admin account configured",
		createdAt: "2 hours ago",
		date: "Today",
	},
];

function AuditPage() {
	const getActionIcon = (action: AuditAction) => {
		switch (action) {
			case "ban_user":
			case "unban_user":
				return Ban;
			case "delete_post":
			case "delete_comment":
				return Trash2;
			case "change_role":
				return Shield;
			case "resolve_report":
				return Check;
			default:
				return FileText;
		}
	};

	const getIconStyle = (action: AuditAction) => {
		switch (action) {
			case "ban_user":
			case "delete_post":
			case "delete_comment":
				return styles.logIconDelete;
			case "change_role":
				return styles.logIconRole;
			case "resolve_report":
				return styles.logIconResolve;
			default:
				return styles.logIconDefault;
		}
	};

	const getActionLabel = (action: AuditAction) => {
		switch (action) {
			case "ban_user":
				return "Banned User";
			case "unban_user":
				return "Unbanned User";
			case "delete_post":
				return "Deleted Post";
			case "delete_comment":
				return "Deleted Comment";
			case "change_role":
				return "Changed Role";
			case "resolve_report":
				return "Resolved Report";
			default:
				return action;
		}
	};

	const getTargetIcon = (type: string) => {
		switch (type) {
			case "user":
				return User;
			case "post":
				return FileText;
			case "comment":
				return MessageSquare;
			default:
				return FileText;
		}
	};

	// Group logs by date
	const groupedLogs = mockAuditLogs.reduce(
		(acc, log) => {
			if (!acc[log.date]) {
				acc[log.date] = [];
			}
			acc[log.date].push(log);
			return acc;
		},
		{} as Record<string, typeof mockAuditLogs>,
	);

	return (
		<main {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<h1 {...stylex.props(styles.title)}>Audit Log</h1>
				<div {...stylex.props(styles.filters)}>
					<button type="button" {...stylex.props(styles.filterButton)}>
						<Filter size={16} />
						Filter
					</button>
					<div {...stylex.props(styles.searchContainer)}>
						<Search size={16} {...stylex.props(styles.searchIcon)} />
						<input type="text" placeholder="Search logs..." {...stylex.props(styles.searchInput)} />
					</div>
				</div>
			</header>

			{Object.entries(groupedLogs).map(([date, logs], dateIndex) => (
				<div key={date}>
					<h2 {...stylex.props(styles.dateHeader, dateIndex === 0 && styles.dateHeaderFirst)}>
						{date}
					</h2>
					<div {...stylex.props(styles.timeline)}>
						<div {...stylex.props(styles.timelineLine)} />
						{logs.map((log, index) => {
							const ActionIcon = getActionIcon(log.action);
							const TargetIcon = getTargetIcon(log.targetType);
							const isLast = index === logs.length - 1;

							return (
								<div key={log.id} {...stylex.props(styles.logEntry, isLast && styles.logEntryLast)}>
									<div {...stylex.props(styles.logIcon, getIconStyle(log.action))}>
										<ActionIcon size={12} />
									</div>
									<div {...stylex.props(styles.logCard)}>
										<div {...stylex.props(styles.logHeader)}>
											<span {...stylex.props(styles.logAction)}>{getActionLabel(log.action)}</span>
											<span {...stylex.props(styles.logTime)}>
												<Calendar size={12} />
												{log.createdAt}
											</span>
										</div>
										<p {...stylex.props(styles.logDescription)}>{log.details}</p>
										<div {...stylex.props(styles.logMeta)}>
											<span {...stylex.props(styles.logMetaItem)}>
												<Shield size={12} />
												By{" "}
												<Link
													to="/users/$userId"
													params={{ userId: log.adminId }}
													{...stylex.props(styles.adminLink)}
												>
													@{log.adminUsername}
												</Link>
											</span>
											<span {...stylex.props(styles.logMetaItem)}>
												<TargetIcon size={12} />
												Target:{" "}
												<Link
													to={log.targetType === "user" ? "/users/$userId" : "/posts/$postId"}
													params={
														log.targetType === "user"
															? { userId: log.targetId }
															: { postId: log.targetId }
													}
													{...stylex.props(styles.targetLink)}
												>
													{log.targetName}
												</Link>
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			))}
		</main>
	);
}
