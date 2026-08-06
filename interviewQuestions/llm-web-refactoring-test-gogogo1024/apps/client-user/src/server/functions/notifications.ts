import { createServerFn } from "@tanstack/react-start";
import { fromProtoTimestamp, getGrpcClient, requireGrpcSessionToken } from "../../lib/grpc.server";

export const getNotifications = createServerFn()
	.inputValidator((d: { limit?: number; offset?: number }) => d)
	.handler(async ({ data }) => {
		const sessionToken = await requireGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.notifications.getNotifications({
			sessionToken,
			limit: data.limit || 20,
			offset: data.offset || 0,
		});

		return response.notifications.map((n) => ({
			id: n.id,
			type: n.type,
			read: n.read,
			actor: n.actor
				? {
						id: n.actor.id,
						username: n.actor.username,
						displayName: n.actor.displayName,
						avatarUrl: n.actor.avatarUrl ?? undefined,
					}
				: undefined,
			postId: n.postId ?? undefined,
			commentId: n.commentId ?? undefined,
			postContent: n.postContent ?? undefined,
			commentContent: n.commentContent ?? undefined,
			createdAt: fromProtoTimestamp(n.createdAt),
		}));
	});

export const getUnreadCount = createServerFn().handler(async () => {
	const sessionToken = await requireGrpcSessionToken();
	const client = getGrpcClient();

	const { response } = await client.notifications.getUnreadCount({
		sessionToken,
	});

	return response.count;
});

export const markAsRead = createServerFn({ method: "POST" })
	.inputValidator((d: string) => d)
	.handler(async ({ data: notificationId }) => {
		const sessionToken = await requireGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.notifications.markAsRead({
			sessionToken,
			notificationId,
		});

		if (!response.success) {
			throw new Error(response.error || "Failed to mark notification as read");
		}

		return { success: true };
	});

export const markAllAsRead = createServerFn({ method: "POST" }).handler(async () => {
	const sessionToken = await requireGrpcSessionToken();
	const client = getGrpcClient();

	const { response } = await client.notifications.markAllAsRead({
		sessionToken,
	});

	if (!response.success) {
		throw new Error(response.error || "Failed to mark all notifications as read");
	}

	return { success: true };
});

export const deleteNotification = createServerFn({ method: "POST" })
	.inputValidator((d: string) => d)
	.handler(async ({ data: notificationId }) => {
		const sessionToken = await requireGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.notifications.deleteNotification({
			sessionToken,
			notificationId,
		});

		if (!response.success) {
			throw new Error(response.error || "Failed to delete notification");
		}

		return { success: true };
	});
