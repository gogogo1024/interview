import * as stylex from "@stylexjs/stylex";
import { AlertCircle, Send } from "lucide-react";
import { useState } from "react";
import { createPost } from "../../server/functions/posts";
import { colors, radii, semanticColors, spacing } from "../../tokens.stylex";
import { CharacterCount } from "../shared/CharacterCount";

const spin = stylex.keyframes({
	from: { transform: "rotate(0deg)" },
	to: { transform: "rotate(360deg)" },
});

const styles = stylex.create({
	form: {
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.xl,
		boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)",
		padding: spacing.lg,
	},
	errorBox: {
		marginBottom: spacing.md,
		padding: spacing.sm,
		backgroundColor: semanticColors.errorBg,
		color: semanticColors.error,
		borderRadius: radii.lg,
		fontSize: "0.8125rem",
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		border: semanticColors.errorBorder,
	},
	errorIcon: {
		flexShrink: 0,
	},
	inputWrapper: {
		position: "relative",
		borderRadius: radii.lg,
		backgroundColor: semanticColors.surfaceInput,
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
	},
	inputWrapperFocused: {
		backgroundColor: semanticColors.surfaceCard,
		boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.12)",
	},
	textarea: {
		width: "100%",
		padding: spacing.md,
		fontSize: "0.9375rem",
		backgroundColor: "transparent",
		resize: "none",
		border: "none",
		outline: "none",
		lineHeight: "1.6",
		"::placeholder": {
			color: semanticColors.textTertiary,
		},
	},
	footer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: spacing.md,
	},
	submitButton: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingLeft: spacing.xl,
		paddingRight: spacing.xl,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		backgroundImage: `linear-gradient(135deg, ${colors.indigo500}, ${colors.blue600})`,
		color: colors.white,
		borderRadius: radii.lg,
		fontWeight: 600,
		fontSize: "0.875rem",
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
		width: "1rem",
		height: "1rem",
		borderWidth: "2px",
		borderStyle: "solid",
		borderColor: "rgba(255, 255, 255, 0.3)",
		borderTopColor: colors.white,
		borderRadius: radii.full,
		animationName: spin,
		animationDuration: "0.7s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
});

export function PostForm({ onSuccess }: { onSuccess?: () => void }) {
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
			await createPost({ data: { content } });
			setContent("");
			onSuccess?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create post");
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
					placeholder="What's happening?"
					{...stylex.props(styles.textarea)}
					rows={3}
					maxLength={280}
				/>
			</div>

			<div {...stylex.props(styles.footer)}>
				<CharacterCount count={content.length} max={280} />
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
							Post
						</>
					)}
				</button>
			</div>
		</form>
	);
}
