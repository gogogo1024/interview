import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getUnreadCount } from "../../server/functions/notifications";
import { colors, radii, spacing } from "../../tokens.stylex";

const styles = stylex.create({
	bellContainer: {
		position: "relative",
	},
	bellLink: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: spacing.sm,
		borderRadius: radii.full,
		color: colors.gray600,
		transition: "all 0.2s",
		textDecoration: "none",
		":hover": {
			backgroundColor: colors.gray100,
			color: colors.gray900,
		},
	},
	bellLinkActive: {
		backgroundColor: colors.blue100,
		color: colors.blue700,
	},
	badge: {
		position: "absolute",
		top: "-2px",
		right: "-2px",
		minWidth: "18px",
		height: "18px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.red500,
		color: colors.white,
		fontSize: "0.75rem",
		fontWeight: 600,
		borderRadius: radii.full,
		paddingLeft: "4px",
		paddingRight: "4px",
		borderWidth: "2px",
		borderStyle: "solid",
		borderColor: colors.white,
	},
});

interface NotificationBellProps {
	isActive?: boolean;
}

export function NotificationBell({ isActive }: NotificationBellProps) {
	const [unreadCount, setUnreadCount] = useState(0);

	const loadUnreadCount = useCallback(async () => {
		try {
			const count = await getUnreadCount();
			setUnreadCount(count);
		} catch (error) {
			// User might not be logged in
			console.error("Failed to load unread count:", error);
		}
	}, []);

	useEffect(() => {
		loadUnreadCount();
		// Poll for new notifications every 30 seconds
		const interval = setInterval(loadUnreadCount, 30000);
		return () => clearInterval(interval);
	}, [loadUnreadCount]);

	return (
		<div {...stylex.props(styles.bellContainer)}>
			<Link
				to="/notifications"
				{...stylex.props(styles.bellLink, isActive && styles.bellLinkActive)}
				title="Notifications"
			>
				<Bell size={20} />
			</Link>
			{unreadCount > 0 && (
				<span {...stylex.props(styles.badge)}>{unreadCount > 99 ? "99+" : unreadCount}</span>
			)}
		</div>
	);
}
