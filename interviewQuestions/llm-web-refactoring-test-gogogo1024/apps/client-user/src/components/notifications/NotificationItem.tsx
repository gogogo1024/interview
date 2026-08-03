import * as stylex from "@stylexjs/stylex";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";
import { deleteNotification, markAsRead } from "../../server/functions/notifications";
import { colors, radii, spacing } from "../../tokens.stylex";
import { RelativeTime } from "../shared/RelativeTime";
import { UserAvatar } from "../users/UserAvatar";

const styles = stylex.create({
	item: {
		display: "flex",
		gap: spacing.md,
		padding: spacing.md,
		transition: "background-color 0.2s",
		cursor: "pointer",
		borderBottomWidth: "1px",
		borderBottomStyle: "solid",
		borderBottomColor: colors.gray100,
		":hover": {
			backgroundColor: colors.gray50,
		},
	},
	itemUnread: {
		backgroundColor: colors.blue50,
		":hover": {
			backgroundColor: colors.blue100,
		},
	},
	iconContainer: {
		width: "40px",
		height: "40px",
		borderRadius: radii.full,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	iconLike: {
		backgroundColor: colors.red50,
		color: colors.red500,
	},
	iconComment: {
		backgroundColor: colors.blue100,
		color: colors.blue500,
	},
	iconFollow: {
		backgroundColor: colors.blue50,
		color: colors.purple600,
	},
	iconMention: {
		backgroundColor: colors.gray100,
		color: colors.green600,
	},
	content: {
		flex: 1,
		minWidth: 0,
	},
	textRow: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		flexWrap: "wrap",
	},
	actorName: {
		fontWeight: 600,
		color: colors.gray900,
	},
	message: {
		color: colors.gray600,
	},
	preview: {
		marginTop: spacing.xs,
		color: colors.gray500,
		fontSize: "0.875rem",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	meta: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		marginTop: spacing.xs,
	},
	unreadDot: {
		width: "8px",
		height: "8px",
		borderRadius: radii.full,
		backgroundColor: colors.blue500,
	},
	deleteButton: {
		padding: spacing.xs,
		borderRadius: radii.full,
		backgroundColor: "transparent",
		border: "none",
		cursor: "pointer",
		color: colors.gray400,
		transition: "all 0.2s",
		":hover": {
			backgroundColor: colors.red50,
			color: colors.red500,
		},
	},
	avatarWrapper: {
		flexShrink: 0,
	},
});

interface NotificationItemProps {
	notification: {
		id: string;
		type: string;
		read: boolean;
		actor?: {
			id: string;
			username: string;
			displayName: string;
			avatarUrl?: string;
		};
		postId?: string;
		commentId?: string;
		postContent?: string;
		commentContent?: string;
		createdAt: Date;
	};
	onRead?: () => void;
	onDelete?: () => void;
}

export function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const getMessage = () => {
		switch (notification.type) {
			case "like":
				return notification.commentId ? "liked your comment" : "liked your post";
			case "comment":
				return "commented on your post";
			case "follow":
				return "started following you";
			case "mention":
				return "mentioned you";
			default:
				return "interacted with you";
		}
	};

	const getPreview = () => {
		if (notification.commentContent) {
			return notification.commentContent;
		}
		if (notification.postContent) {
			return notification.postContent;
		}
		return null;
	};

	const handleClick = async () => {
		// Mark as read if unread
		if (!notification.read) {
			try {
				await markAsRead({ data: notification.id });
				onRead?.();
			} catch (error) {
				console.error("Failed to mark as read:", error);
			}
		}

		// Navigate to relevant content
		if (notification.type === "follow" && notification.actor) {
			navigate({ to: "/users/$username", params: { username: notification.actor.username } });
		} else if (notification.postId) {
			navigate({ to: "/posts/$postId", params: { postId: notification.postId } });
		}
	};

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (loading) return;

		setLoading(true);
		try {
			await deleteNotification({ data: notification.id });
			onDelete?.();
		} catch (error) {
			console.error("Failed to delete notification:", error);
		} finally {
			setLoading(false);
		}
	};

	const preview = getPreview();

	return (
		<div
			{...stylex.props(styles.item, !notification.read && styles.itemUnread)}
			onClick={handleClick}
			onKeyDown={(e) => e.key === "Enter" && handleClick()}
			role="button"
			tabIndex={0}
		>
			<div {...stylex.props(styles.avatarWrapper)}>
				{notification.actor && (
					<UserAvatar
						avatarUrl={notification.actor.avatarUrl}
						username={notification.actor.username}
						size="sm"
					/>
				)}
			</div>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.textRow)}>
					<span {...stylex.props(styles.actorName)}>
						{notification.actor?.displayName || "Someone"}
					</span>
					<span {...stylex.props(styles.message)}>{getMessage()}</span>
				</div>

				{preview && <p {...stylex.props(styles.preview)}>"{preview}"</p>}

				<div {...stylex.props(styles.meta)}>
					<RelativeTime date={notification.createdAt} />
					{!notification.read && <span {...stylex.props(styles.unreadDot)} />}
				</div>
			</div>

			<button
				type="button"
				onClick={handleDelete}
				disabled={loading}
				{...stylex.props(styles.deleteButton)}
				title="Delete notification"
			>
				<X size={16} />
			</button>
		</div>
	);
}
