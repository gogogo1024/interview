import { notifications } from "@chirp/db-schema";
import { describe, expect, it } from "vitest";
import { createTestUser } from "../../tests/helpers";
import { db } from "../db";
import { ApiError, Codes } from "../observability/errors";
import {
	deleteNotification,
	getNotifications,
	markNotificationAsRead,
} from "./notifications.service";

describe("NotificationsService", () => {
	it("returns notifications for the current user", async () => {
		const user = await createTestUser();
		const actor = await createTestUser({ username: "actor-user", email: "actor@example.com" });

		await db.insert(notifications).values({
			id: "notif-1",
			userId: user.id,
			type: "like",
			actorId: actor.id,
			read: 0,
		});

		const result = await getNotifications(user.id);

		expect(result).toHaveLength(1);
		expect(result[0].type).toBe("like");
	});

	it("throws when marking a notification that does not belong to the user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser({ username: "intruder", email: "intruder@example.com" });

		await db.insert(notifications).values({
			id: "notif-2",
			userId: owner.id,
			type: "follow",
			actorId: owner.id,
			read: 0,
		});

		await expect(markNotificationAsRead("notif-2", otherUser.id)).rejects.toMatchObject({
			code: Codes.Unauthorized,
		});
	});

	it("throws when deleting a missing notification", async () => {
		const user = await createTestUser();

		await expect(deleteNotification("missing", user.id)).rejects.toBeInstanceOf(ApiError);
	});
});
