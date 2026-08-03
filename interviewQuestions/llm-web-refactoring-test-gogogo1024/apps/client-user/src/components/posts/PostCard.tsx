import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { Edit, Heart, MessageCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { togglePostLike } from "../../server/functions/likes";
import { deletePost } from "../../server/functions/posts";
import { colors, radii, semanticColors, shadows, spacing } from "../../tokens.stylex";
import { ParsedContent } from "../shared/ParsedContent";
import { RelativeTime } from "../shared/RelativeTime";
import { UserAvatar } from "../users/UserAvatar";
import { BookmarkButton } from "./BookmarkButton";

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
	article: {
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.xl,
		boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)",
		padding: spacing.lg,
		transition: "box-shadow 0.2s",
		animationName: fadeInUp,
		animationDuration: "0.3s",
		animationFillMode: "both",
		":hover": {
			boxShadow: shadows.md,
		},
	},
	container: {
		display: "flex",
		gap: spacing.md,
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
		color: semanticColors.textPrimary,
		textDecoration: "none",
		transition: "color 0.2s",
		":hover": {
			color: colors.blue600,
		},
	},
	username: {
		color: semanticColors.textTertiary,
		fontSize: "0.875rem",
		textDecoration: "none",
		transition: "color 0.2s",
		":hover": {
			color: semanticColors.textSecondary,
		},
	},
	separator: {
		color: semanticColors.textTertiary,
	},
	editedBadge: {
		fontSize: "0.75rem",
		color: semanticColors.textTertiary,
		backgroundColor: semanticColors.bgSecondary,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		paddingTop: "0.125rem",
		paddingBottom: "0.125rem",
		borderRadius: radii.full,
	},
	postContent: {
		display: "block",
		marginTop: spacing.sm,
		color: semanticColors.textPrimary,
		whiteSpace: "pre-wrap",
		overflowWrap: "break-word",
		lineHeight: 1.625,
		textDecoration: "none",
		transition: "color 0.2s",
		":hover": {
			color: semanticColors.textSecondary,
		},
	},
	actions: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		marginTop: spacing.md,
		marginLeft: "-0.5rem",
	},
	actionButton: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderRadius: radii.full,
		transition: "all 0.2s",
		backgroundColor: "transparent",
		border: "none",
		cursor: "pointer",
		color: semanticColors.textTertiary,
		":hover": {
			color: colors.red500,
			backgroundColor: colors.red50,
		},
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
		},
	},
	actionButtonLiked: {
		color: colors.red500,
		backgroundColor: colors.red50,
	},
	commentLink: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderRadius: radii.full,
		color: semanticColors.textTertiary,
		textDecoration: "none",
		transition: "all 0.2s",
		":hover": {
			color: colors.blue500,
			backgroundColor: colors.blue50,
		},
	},
	actionCount: {
		fontSize: "0.875rem",
		fontWeight: 500,
	},
	ownerActions: {
		flex: 1,
		display: "flex",
		justifyContent: "flex-end",
		gap: spacing.xs,
	},
	iconButton: {
		padding: spacing.sm,
		borderRadius: radii.full,
		backgroundColor: "transparent",
		border: "none",
		cursor: "pointer",
		color: semanticColors.textTertiary,
		transition: "all 0.2s",
		":hover": {
			color: colors.blue500,
			backgroundColor: colors.blue50,
		},
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
		},
	},
	iconButtonDanger: {
		":hover": {
			color: colors.red500,
			backgroundColor: colors.red50,
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

interface PostCardProps {
	post: {
		id: string;
		content: string;
		createdAt: Date;
		updatedAt: Date;
		author: {
			id: string;
			username: string;
			displayName: string;
			avatarUrl?: string | null;
		};
		likeCount: number;
		commentCount: number;
	};
	currentUserId?: string;
	onDelete?: () => void;
}

export function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(post.likeCount);
	const [loading, setLoading] = useState(false);
	const [animateLike, setAnimateLike] = useState(false);

	const isOwnPost = currentUserId === post.author.id;
	const canEdit = isOwnPost && Date.now() - post.createdAt.getTime() < 5 * 60 * 1000;

	const handleLike = async () => {
		if (loading) return;
		setLoading(true);

		try {
			const result = await togglePostLike({ data: post.id });
			setLiked(result.liked);
			setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
			if (result.liked) {
				setAnimateLike(true);
				setTimeout(() => setAnimateLike(false), 400);
			}
		} catch (error) {
			console.error("Failed to like post:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this post?")) return;

		setLoading(true);
		try {
			await deletePost({ data: post.id });
			onDelete?.();
		} catch (error) {
			console.error("Failed to delete post:", error);
			alert("Failed to delete post");
		} finally {
			setLoading(false);
		}
	};

	return (
		<article {...stylex.props(styles.article)}>
			<div {...stylex.props(styles.container)}>
				<Link to="/users/$username" params={{ username: post.author.username }}>
					<UserAvatar avatarUrl={post.author.avatarUrl} username={post.author.username} />
				</Link>

				<div {...stylex.props(styles.content)}>
					{/* Author Info */}
					<div {...stylex.props(styles.authorInfo)}>
						<Link
							to="/users/$username"
							params={{ username: post.author.username }}
							{...stylex.props(styles.displayName)}
						>
							{post.author.displayName}
						</Link>
						<Link
							to="/users/$username"
							params={{ username: post.author.username }}
							{...stylex.props(styles.username)}
						>
							@{post.author.username}
						</Link>
						<span {...stylex.props(styles.separator)}>·</span>
						<RelativeTime date={post.createdAt} />
						{post.updatedAt.getTime() !== post.createdAt.getTime() && (
							<span {...stylex.props(styles.editedBadge)}>edited</span>
						)}
					</div>

					{/* Post Content */}
					<Link
						to="/posts/$postId"
						params={{ postId: post.id }}
						{...stylex.props(styles.postContent)}
					>
						<ParsedContent content={post.content} />
					</Link>

					{/* Actions */}
					<div {...stylex.props(styles.actions)}>
						<button
							type="button"
							onClick={handleLike}
							disabled={loading}
							{...stylex.props(styles.actionButton, liked && styles.actionButtonLiked)}
						>
							<Heart
								size={20}
								{...stylex.props(liked && styles.heartFilled, animateLike && styles.heartBeat)}
							/>
							<span {...stylex.props(styles.actionCount)}>{likeCount}</span>
						</button>

						<Link
							to="/posts/$postId"
							params={{ postId: post.id }}
							{...stylex.props(styles.commentLink)}
						>
							<MessageCircle size={20} />
							<span {...stylex.props(styles.actionCount)}>{post.commentCount}</span>
						</Link>

						<BookmarkButton postId={post.id} />

						{isOwnPost && (
							<div {...stylex.props(styles.ownerActions)}>
								{canEdit && (
									<Link
										to="/posts/$postId"
										params={{ postId: post.id }}
										{...stylex.props(styles.iconButton)}
										title="Edit post"
									>
										<Edit size={16} />
									</Link>
								)}
								<button
									type="button"
									onClick={handleDelete}
									disabled={loading}
									{...stylex.props(styles.iconButton, styles.iconButtonDanger)}
									title="Delete post"
								>
									<Trash2 size={16} />
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</article>
	);
}
