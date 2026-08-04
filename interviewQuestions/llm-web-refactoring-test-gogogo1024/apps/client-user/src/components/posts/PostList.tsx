import * as stylex from "@stylexjs/stylex";
import { FileText } from "lucide-react";
import { colors, radii, spacing } from "../../tokens.stylex";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { PostCard } from "./PostCard";

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

const styles = stylex.create({
	loadingContainer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: spacing.xl,
		paddingBottom: spacing.xl,
	},
	emptyState: {
		backgroundColor: colors.white,
		borderRadius: radii.xl,
		boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)",
		padding: spacing.xl,
		textAlign: "center",
	},
	emptyIcon: {
		width: "4rem",
		height: "4rem",
		borderRadius: radii.xl,
		backgroundColor: colors.gray100,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginLeft: "auto",
		marginRight: "auto",
		marginBottom: spacing.md,
	},
	emptyTitle: {
		fontSize: "1.125rem",
		fontWeight: 600,
		color: colors.gray900,
		marginBottom: spacing.sm,
	},
	emptyText: {
		color: colors.gray500,
	},
	postList: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.md,
	},
	postItem: {
		animationName: fadeInUp,
		animationDuration: "0.3s",
		animationFillMode: "both",
	},
});

interface Post {
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
}

export function PostList({
	posts,
	loading,
	currentUserId,
	onPostDelete,
}: {
	posts: Post[];
	loading?: boolean;
	currentUserId?: string;
	onPostDelete?: () => void;
}) {
	if (loading) {
		return (
			<div {...stylex.props(styles.loadingContainer)}>
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (posts.length === 0) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<div {...stylex.props(styles.emptyIcon)}>
					<FileText size={32} color={colors.gray400} />
				</div>
				<h3 {...stylex.props(styles.emptyTitle)}>No posts yet</h3>
				<p {...stylex.props(styles.emptyText)}>Be the first to share something!</p>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.postList)}>
			{posts.map((post, index) => (
				<div
					key={post.id}
					style={{ animationDelay: `${index * 50}ms` }}
					{...stylex.props(styles.postItem)}
				>
					<PostCard post={post} currentUserId={currentUserId} onDelete={onPostDelete} />
				</div>
			))}
		</div>
	);
}
