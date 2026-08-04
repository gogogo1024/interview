import * as stylex from "@stylexjs/stylex";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { getBookmarkStatus, toggleBookmark } from "../../server/functions/bookmarks";
import { colors, radii, spacing } from "../../tokens.stylex";

const styles = stylex.create({
	button: {
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
		color: colors.gray400,
		":hover": {
			color: colors.blue500,
			backgroundColor: colors.blue50,
		},
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
		},
	},
	buttonBookmarked: {
		color: colors.blue500,
		backgroundColor: colors.blue50,
	},
	iconFilled: {
		fill: "currentColor",
	},
});

interface BookmarkButtonProps {
	postId: string;
	initialBookmarked?: boolean;
}

export function BookmarkButton({ postId, initialBookmarked = false }: BookmarkButtonProps) {
	const [bookmarked, setBookmarked] = useState(initialBookmarked);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadBookmarkStatus();
	}, [postId]);

	const loadBookmarkStatus = async () => {
		try {
			const status = await getBookmarkStatus({ data: postId });
			setBookmarked(status.bookmarked);
		} catch (error) {
			// User might not be logged in
			console.error("Failed to load bookmark status:", error);
		}
	};

	const handleToggle = async () => {
		if (loading) return;
		setLoading(true);

		try {
			const result = await toggleBookmark({ data: postId });
			setBookmarked(result.bookmarked);
		} catch (error) {
			console.error("Failed to toggle bookmark:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			type="button"
			onClick={handleToggle}
			disabled={loading}
			title={bookmarked ? "Remove bookmark" : "Bookmark"}
			{...stylex.props(styles.button, bookmarked && styles.buttonBookmarked)}
		>
			<Bookmark size={20} {...stylex.props(bookmarked && styles.iconFilled)} />
		</button>
	);
}
