import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteComment } from "../../server/functions/comments";
import { toggleCommentLike } from "../../server/functions/likes";
import { colors, radii, spacing } from "../../tokens.stylex";
import { ParsedContent } from "../shared/ParsedContent";
import { RelativeTime } from "../shared/RelativeTime";
import { UserAvatar } from "../users/UserAvatar";

const fadeInUp = stylex.keyframes({
	from: {
		opacity: 0,
		transform: "translateY(10px)",
	},
	to: {
		opacity: 1,
		transform: "translateY(0)",
	},
});

const heartBeat = stylex.keyframes({
	"0%": { transform: "scale(1)" },
	"25%": { transform: "scale(1.3)" },
	"50%": { transform: "scale(1)" },
	"75%": { transform: "scale(1.3)" },
	"100%": { transform: "scale(1)" },
});

const styles = stylex.create({
	container: {
		display: "flex",
		gap: spacing.sm,
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		borderBottom: `1px solid rgba(241, 245, 249, 0.8)`,
		animationName: fadeInUp,
		animationDuration: "0.3s",
		animationFillMode: "both",
		":last-child": {
			borderBottom: "none",
		},
	},
	content: {
		flex: 1,
		minWidth: 0,
	},
	authorInfo: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		flexWrap: "wrap",
	},
	displayName: {
		fontWeight: 600,
		fontSize: "0.875rem",
		color: colors.gray900,
		textDecoration: "none",
		transition: "color 0.2s",
		":hover": {
			color: colors.blue600,
		},
	},
	username: {
		color: colors.gray400,
		fontSize: "0.875rem",
		textDecoration: "none",
		transition: "color 0.2s",
		":hover": {
			color: colors.gray600,
		},
	},
	separator: {
		color: colors.gray300,
	},
	time: {
		color: colors.gray400,
		fontSize: "0.875rem",
	},
	commentContent: {
		marginTop: spacing.sm,
		fontSize: "0.875rem",
		color: colors.gray800,
		whiteSpace: "pre-wrap",
		overflowWrap: "break-word",
		lineHeight: 1.625,
	},
	actions: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		marginTop: spacing.sm,
		marginLeft: "-0.5rem",
	},
	likeButton: {
		display: "flex",
		alignItems: "center",
		gap: "0.375rem",
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		paddingTop: "0.375rem",
		paddingBottom: "0.375rem",
		borderRadius: radii.full,
		transition: "all 0.2s",
		backgroundColor: "transparent",
		border: "none",
		cursor: "pointer",
		color: colors.gray400,
		":hover": {
			color: colors.red500,
			backgroundColor: colors.red50,
		},
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
		},
	},
	likeButtonLiked: {
		color: colors.red500,
		backgroundColor: colors.red50,
	},
	deleteButton: {
		padding: "0.375rem",
		borderRadius: radii.full,
		backgroundColor: "transparent",
		border: "none",
		cursor: "pointer",
		color: colors.gray400,
		transition: "all 0.2s",
		":hover": {
			color: colors.red500,
			backgroundColor: colors.red50,
		},
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
		},
	},
	heartFilled: {
		fill: "currentColor",
	},
	heartBeat: {
		animationName: heartBeat,
		animationDuration: "0.4s",
	},
});

interface CommentCardProps {
	comment: {
		id: string;
		content: string;
		createdAt: Date;
		author: {
			id: string;
			username: string;
			displayName: string;
			avatarUrl?: string | null;
		};
		replies?: unknown[];
	};
	currentUserId?: string;
	onDelete?: () => void;
}

export function CommentCard({ comment, currentUserId, onDelete }: CommentCardProps) {
	const [liked, setLiked] = useState(false);
	const [loading, setLoading] = useState(false);
	const [animateLike, setAnimateLike] = useState(false);

	const isOwnComment = currentUserId === comment.author.id;

	const handleLike = async () => {
		if (loading) return;
		setLoading(true);

		try {
			const result = await toggleCommentLike({ data: comment.id });
			setLiked(result.liked);
			if (result.liked) {
				setAnimateLike(true);
				setTimeout(() => setAnimateLike(false), 400);
			}
		} catch (error) {
			console.error("Failed to like comment:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this comment?")) return;

		setLoading(true);
		try {
			await deleteComment({ data: comment.id });
			onDelete?.();
		} catch (error) {
			console.error("Failed to delete comment:", error);
			alert("Failed to delete comment");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div {...stylex.props(styles.container)}>
			<Link to="/users/$username" params={{ username: comment.author.username }}>
				<UserAvatar
					avatarUrl={comment.author.avatarUrl}
					username={comment.author.username}
					size="sm"
				/>
			</Link>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.authorInfo)}>
					<Link
						to="/users/$username"
						params={{ username: comment.author.username }}
						{...stylex.props(styles.displayName)}
					>
						{comment.author.displayName}
					</Link>
					<Link
						to="/users/$username"
						params={{ username: comment.author.username }}
						{...stylex.props(styles.username)}
					>
						@{comment.author.username}
					</Link>
					<span {...stylex.props(styles.separator)}>·</span>
					<span {...stylex.props(styles.time)}>
						<RelativeTime date={comment.createdAt} />
					</span>
				</div>

				<p {...stylex.props(styles.commentContent)}>
					<ParsedContent content={comment.content} />
				</p>

				<div {...stylex.props(styles.actions)}>
					<button
						type="button"
						onClick={handleLike}
						disabled={loading}
						{...stylex.props(styles.likeButton, liked && styles.likeButtonLiked)}
					>
						<Heart
							size={16}
							{...stylex.props(liked && styles.heartFilled, animateLike && styles.heartBeat)}
						/>
					</button>

					{isOwnComment && (
						<button
							type="button"
							onClick={handleDelete}
							disabled={loading}
							{...stylex.props(styles.deleteButton)}
							title="Delete comment"
						>
							<Trash2 size={16} />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
