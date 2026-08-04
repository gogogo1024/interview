import { inArray } from "drizzle-orm";
import { db, schema } from "../db";
import { createNotification } from "./notifications.service";

const { users } = schema;

/**
 * Extract @usernames from content
 * Returns unique array of usernames (without the @ symbol)
 */
export function extractMentions(content: string): string[] {
	const mentionPattern = /@([a-zA-Z0-9_]+)/g;
	const matches = content.matchAll(mentionPattern);
	const usernames = [...new Set([...matches].map((m) => m[1]))];
	return usernames;
}

/**
 * Validate that mentioned usernames exist in the database
 * Returns a Map of username -> userId for valid users
 */
export async function validateMentionedUsers(usernames: string[]): Promise<Map<string, string>> {
	if (usernames.length === 0) {
		return new Map();
	}

	const validUsers = await db
		.select({ id: users.id, username: users.username })
		.from(users)
		.where(inArray(users.username, usernames));

	const usernameToId = new Map<string, string>();
	for (const user of validUsers) {
		usernameToId.set(user.username, user.id);
	}

	return usernameToId;
}

/**
 * Create notifications for mentioned users
 * Skips creating notification if the actor mentions themselves
 */
export async function createMentionNotifications(
	mentionedUserIds: string[],
	actorId: string,
	postId?: string,
	commentId?: string,
): Promise<void> {
	// Filter out self-mentions
	const userIdsToNotify = mentionedUserIds.filter((id) => id !== actorId);

	// Create notifications for each mentioned user
	await Promise.all(
		userIdsToNotify.map((userId) =>
			createNotification({
				userId,
				type: "mention",
				actorId,
				postId,
				commentId,
			}),
		),
	);
}

/**
 * Process mentions in content: extract, validate, and create notifications
 * This is a helper function that combines all mention-related operations
 */
export async function processMentions(
	content: string,
	actorId: string,
	postId?: string,
	commentId?: string,
): Promise<void> {
	const mentionedUsernames = extractMentions(content);

	if (mentionedUsernames.length === 0) {
		return;
	}

	const validUsers = await validateMentionedUsers(mentionedUsernames);
	const mentionedUserIds = [...validUsers.values()];

	if (mentionedUserIds.length > 0) {
		await createMentionNotifications(mentionedUserIds, actorId, postId, commentId);
	}
}
