import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { NotificationItem } from "../components/notifications/NotificationItem";
import { getCurrentUser } from "../server/functions/auth";
import { getNotifications, markAllAsRead } from "../server/functions/notifications";
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
		justifyContent: "space-between",
		marginBottom: spacing["2xl"],
	},
	headerLeft: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
	},
	iconBox: {
		width: "2.25rem",
		height: "2.25rem",
		borderRadius: radii.lg,
		backgroundImage: `linear-gradient(135deg, ${colors.indigo500}, ${colors.purple600})`,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		boxShadow: "0 4px 12px -2px rgba(99, 102, 241, 0.25)",
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
	markAllButton: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderRadius: radii.lg,
		backgroundColor: semanticColors.primaryLight,
		color: colors.indigo500,
		fontWeight: 500,
		fontSize: "0.8125rem",
		border: "none",
		cursor: "pointer",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		":hover": {
			backgroundColor: "rgba(99, 102, 241, 0.1)",
		},
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
		},
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
});

export const Route = createFileRoute("/notifications")({
	component: NotificationsPage,
});

function NotificationsPage() {
	const [notifications, setNotifications] = useState<any[]>([]);
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [markingAll, setMarkingAll] = useState(false);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const currentUser = await getCurrentUser();
			setUser(currentUser);

			if (currentUser) {
				const notificationsList = await getNotifications({ data: {} });
				setNotifications(notificationsList);
			}
		} catch (error) {
			console.error("Failed to load notifications:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleMarkAllAsRead = async () => {
		if (markingAll) return;

		setMarkingAll(true);
		try {
			await markAllAsRead();
			// Update local state
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
		} catch (error) {
			console.error("Failed to mark all as read:", error);
		} finally {
			setMarkingAll(false);
		}
	};

	const hasUnread = notifications.some((n) => !n.read);

	if (loading) {
		return (
			<div {...stylex.props(styles.container)}>
				<div {...stylex.props(styles.card, styles.loadingState)}>Loading notifications...</div>
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
						to view your notifications.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.header)}>
				<div {...stylex.props(styles.headerLeft)}>
					<div {...stylex.props(styles.iconBox)}>
						<Bell size={20} color="white" />
					</div>
					<div>
						<h1 {...stylex.props(styles.title)}>Notifications</h1>
						<p {...stylex.props(styles.subtitle)}>
							{notifications.length} notification{notifications.length !== 1 ? "s" : ""}
						</p>
					</div>
				</div>

				{hasUnread && (
					<button
						type="button"
						onClick={handleMarkAllAsRead}
						disabled={markingAll}
						{...stylex.props(styles.markAllButton)}
					>
						<CheckCheck size={16} />
						Mark all read
					</button>
				)}
			</div>

			<div {...stylex.props(styles.card)}>
				{notifications.length === 0 ? (
					<div {...stylex.props(styles.emptyState)}>
						<div {...stylex.props(styles.emptyIcon)}>
							<Inbox size={32} color={colors.gray400} />
						</div>
						<h3 {...stylex.props(styles.emptyTitle)}>No notifications yet</h3>
						<p {...stylex.props(styles.emptyText)}>
							When someone interacts with you, you'll see it here.
						</p>
					</div>
				) : (
					notifications.map((notification) => (
						<NotificationItem
							key={notification.id}
							notification={notification}
							onRead={loadData}
							onDelete={loadData}
						/>
					))
				)}
			</div>
		</div>
	);
}
