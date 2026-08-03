import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { colors } from "../../tokens.stylex";

const styles = stylex.create({
	mention: {
		color: colors.blue600,
		textDecoration: "none",
		fontWeight: 500,
		transition: "color 0.2s",
		":hover": {
			color: colors.blue700,
			textDecoration: "underline",
		},
	},
});

interface ParsedContentProps {
	content: string;
}

/**
 * Renders content with @mentions as clickable links to user profiles
 */
export function ParsedContent({ content }: ParsedContentProps) {
	const mentionPattern = /@([a-zA-Z0-9_]+)/g;
	const parts: (string | ReactNode)[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let key = 0;

	// Reset regex state
	mentionPattern.lastIndex = 0;

	while ((match = mentionPattern.exec(content)) !== null) {
		// Add text before mention
		if (match.index > lastIndex) {
			parts.push(content.slice(lastIndex, match.index));
		}

		// Add mention link
		const username = match[1];
		parts.push(
			<Link
				key={key++}
				to="/users/$username"
				params={{ username }}
				{...stylex.props(styles.mention)}
				onClick={(e) => e.stopPropagation()}
			>
				@{username}
			</Link>,
		);

		lastIndex = match.index + match[0].length;
	}

	// Add remaining text
	if (lastIndex < content.length) {
		parts.push(content.slice(lastIndex));
	}

	// If no mentions found, return content as-is
	if (parts.length === 0) {
		return <>{content}</>;
	}

	return <>{parts}</>;
}
