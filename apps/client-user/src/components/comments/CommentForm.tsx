import * as stylex from "@stylexjs/stylex";
import { AlertCircle, Send } from "lucide-react";
import { useState } from "react";
import { createComment } from "../../server/functions/comments";
import { colors, radii, semanticColors, spacing } from "../../tokens.stylex";

const spin = stylex.keyframes({
	from: { transform: "rotate(0deg)" },
	to: { transform: "rotate(360deg)" },
});

const styles = stylex.create({
	form: {
		marginTop: spacing.md,
	},
	errorBox: {
		marginBottom: spacing.sm,
		padding: spacing.sm,
		backgroundColor: semanticColors.errorBg,
		color: semanticColors.error,
		borderRadius: radii.lg,
		fontSize: "0.8125rem",
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		border: `1px solid ${semanticColors.errorBorder}`,
	},
	errorIcon: {
		flexShrink: 0,
	},
	inputWrapper: {
		position: "relative",
		borderRadius: radii.lg,
		borderWidth: "1.5px",
		borderStyle: "solid",
		borderColor: semanticColors.borderSubtle,
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
	},
	inputWrapperFocused: {
		borderColor: colors.indigo500,
		boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.08)",
	},
	textarea: {
		width: "100%",
		padding: spacing.sm,
		fontSize: "0.8125rem",
		backgroundColor: "transparent",
		borderRadius: radii.lg,
		resize: "none",
		border: "none",
		outline: "none",
		lineHeight: "1.5",
		"::placeholder": {
			color: semanticColors.textTertiary,
		},
	},
	footer: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: spacing.md,
	},
	charCount: {
		fontSize: "0.75rem",
		color: semanticColors.textTertiary,
	},
	charCountWarning: {
		color: colors.orange500,
	},
	charCountError: {
		color: colors.red500,
	},
	submitButton: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingLeft: spacing.lg,
		paddingRight: spacing.lg,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		backgroundImage: `linear-gradient(135deg, ${colors.indigo500}, ${colors.blue600})`,
		color: colors.white,
		borderRadius: radii.lg,
		fontWeight: 600,
		fontSize: "0.8125rem",
		border: "none",
		cursor: "pointer",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		boxShadow: "0 4px 12px -2px rgba(99, 102, 241, 0.25)",
		":hover": {
			boxShadow: "0 6px 16px -2px rgba(99, 102, 241, 0.35)",
			transform: "translateY(-1px)",
		},
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
			boxShadow: "none",
			transform: "none",
		},
	},
	spinner: {
		width: "1.25rem",
		height: "1.25rem",
		borderWidth: "2px",
		borderStyle: "solid",
		borderColor: "rgba(255, 255, 255, 0.3)",
		borderTopColor: colors.white,
		borderRadius: radii.full,
		animationName: spin,
		animationDuration: "1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
});

export function CommentForm({
	postId,
	parentId,
	onSuccess,
}: {
	postId: string;
	parentId?: string;
	onSuccess?: () => void;
}) {
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [isFocused, setIsFocused] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (content.trim().length === 0) return;

		setLoading(true);
		setError("");

		try {
			await createComment({ data: { postId, content, parentId } });
			setContent("");
			onSuccess?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add comment");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
			{error && (
				<div {...stylex.props(styles.errorBox)}>
					<AlertCircle {...stylex.props(styles.errorIcon)} size={16} />
					{error}
				</div>
			)}
			<div {...stylex.props(styles.inputWrapper, isFocused && styles.inputWrapperFocused)}>
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					placeholder="Write a comment..."
					{...stylex.props(styles.textarea)}
					rows={2}
				/>
			</div>
			<div {...stylex.props(styles.footer)}>
				<span
					{...stylex.props(
						styles.charCount,
						content.length > 250 && content.length <= 280 && styles.charCountWarning,
						content.length > 280 && styles.charCountError,
					)}
				>
					{content.length}/280
				</span>
				<button
					type="submit"
					disabled={loading || content.trim().length === 0 || content.length > 280}
					{...stylex.props(styles.submitButton)}
				>
					{loading ? (
						<>
							<div {...stylex.props(styles.spinner)} />
							Posting...
						</>
					) : (
						<>
							<Send size={20} />
							Comment
						</>
					)}
				</button>
			</div>
		</form>
	);
}
