import { desc, eq, gte, like, or, sql } from "drizzle-orm";
import { db, schema } from "../db";
import { generateId } from "./utils";

const { users, posts, comments, reports, auditLogs } = schema;

interface ListUsersOptions {
	limit?: number;
	offset?: number;
	searchQuery?: string;
	roleFilter?: string;
}

interface ListReportsOptions {
	limit?: number;
	offset?: number;
	statusFilter?: string;
	typeFilter?: string;
}

export async function listUsers(options: ListUsersOptions = {}) {
	const limit = options.limit || 20;
	const offset = options.offset || 0;

	let query = db
		.select({
			id: users.id,
			email: users.email,
			username: users.username,
			displayName: users.displayName,
			avatarUrl: users.avatarUrl,
			bio: users.bio,
			role: users.role,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt,
			bannedAt: users.bannedAt,
			bannedReason: users.bannedReason,
		})
		.from(users)
		.$dynamic();

	if (options.searchQuery) {
		const pattern = `%${options.searchQuery}%`;
		query = query.where(
			or(
				like(users.username, pattern),
				like(users.displayName, pattern),
				like(users.email, pattern),
			),
		);
	}

	if (options.roleFilter) {
		query = query.where(eq(users.role, options.roleFilter as "user" | "admin" | "moderator"));
	}

	const result = await query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);

	// Get post and comment counts
	const usersWithCounts = await Promise.all(
		result.map(async (user) => {
			const postCount = await db
				.select({ count: sql<number>`count(*)` })
				.from(posts)
				.where(eq(posts.authorId, user.id))
				.get();

			const commentCount = await db
				.select({ count: sql<number>`count(*)` })
				.from(comments)
				.where(eq(comments.authorId, user.id))
				.get();

			return {
				...user,
				postCount: postCount?.count || 0,
				commentCount: commentCount?.count || 0,
			};
		}),
	);

	// Get total count
	const totalResult = await db.select({ count: sql<number>`count(*)` }).from(users).get();

	return {
		users: usersWithCounts,
		total: totalResult?.count || 0,
	};
}

export async function getUserDetails(userId: string) {
	const user = await db.select().from(users).where(eq(users.id, userId)).get();

	if (!user) {
		throw new Error("User not found");
	}

	const postCount = await db
		.select({ count: sql<number>`count(*)` })
		.from(posts)
		.where(eq(posts.authorId, userId))
		.get();

	const commentCount = await db
		.select({ count: sql<number>`count(*)` })
		.from(comments)
		.where(eq(comments.authorId, userId))
		.get();

	const { passwordHash: _, ...userWithoutPassword } = user;

	return {
		...userWithoutPassword,
		postCount: postCount?.count || 0,
		commentCount: commentCount?.count || 0,
	};
}

export async function banUser(userId: string, reason: string, adminId: string) {
	const user = await db.select().from(users).where(eq(users.id, userId)).get();

	if (!user) {
		throw new Error("User not found");
	}

	if (user.role === "admin") {
		throw new Error("Cannot ban admin users");
	}

	await db
		.update(users)
		.set({
			bannedAt: new Date(),
			bannedReason: reason,
			bannedBy: adminId,
		})
		.where(eq(users.id, userId));

	// Create audit log
	await createAuditLog(adminId, "ban_user", "user", userId, { reason });

	return { success: true };
}

export async function unbanUser(userId: string, adminId: string) {
	const user = await db.select().from(users).where(eq(users.id, userId)).get();

	if (!user) {
		throw new Error("User not found");
	}

	await db
		.update(users)
		.set({
			bannedAt: null,
			bannedReason: null,
			bannedBy: null,
		})
		.where(eq(users.id, userId));

	// Create audit log
	await createAuditLog(adminId, "unban_user", "user", userId);

	return { success: true };
}

export async function updateUserRole(userId: string, role: string, adminId: string) {
	const validRoles = ["user", "admin", "moderator"];
	if (!validRoles.includes(role)) {
		throw new Error("Invalid role");
	}

	const user = await db.select().from(users).where(eq(users.id, userId)).get();

	if (!user) {
		throw new Error("User not found");
	}

	await db
		.update(users)
		.set({ role: role as "user" | "admin" | "moderator" })
		.where(eq(users.id, userId));

	// Create audit log
	await createAuditLog(adminId, "update_role", "user", userId, {
		oldRole: user.role,
		newRole: role,
	});

	return { success: true };
}

export async function deleteUser(userId: string, adminId: string) {
	const user = await db.select().from(users).where(eq(users.id, userId)).get();

	if (!user) {
		throw new Error("User not found");
	}

	if (user.role === "admin") {
		throw new Error("Cannot delete admin users");
	}

	await db.delete(users).where(eq(users.id, userId));

	// Create audit log
	await createAuditLog(adminId, "delete_user", "user", userId, { username: user.username });

	return { success: true };
}

export async function deletePostAdmin(postId: string, reason: string, adminId: string) {
	const post = await db.select().from(posts).where(eq(posts.id, postId)).get();

	if (!post) {
		throw new Error("Post not found");
	}

	await db.delete(posts).where(eq(posts.id, postId));

	// Create audit log
	await createAuditLog(adminId, "delete_post", "post", postId, { reason });

	return { success: true };
}

export async function deleteCommentAdmin(commentId: string, reason: string, adminId: string) {
	const comment = await db.select().from(comments).where(eq(comments.id, commentId)).get();

	if (!comment) {
		throw new Error("Comment not found");
	}

	await db.delete(comments).where(eq(comments.id, commentId));

	// Create audit log
	await createAuditLog(adminId, "delete_comment", "comment", commentId, { reason });

	return { success: true };
}

export async function listReports(options: ListReportsOptions = {}) {
	const limit = options.limit || 20;
	const offset = options.offset || 0;

	let query = db
		.select({
			id: reports.id,
			reporterId: reports.reporterId,
			targetType: reports.targetType,
			targetId: reports.targetId,
			reason: reports.reason,
			description: reports.description,
			status: reports.status,
			reviewedBy: reports.reviewedBy,
			reviewedAt: reports.reviewedAt,
			createdAt: reports.createdAt,
		})
		.from(reports)
		.$dynamic();

	if (options.statusFilter) {
		query = query.where(
			eq(reports.status, options.statusFilter as "pending" | "reviewed" | "actioned" | "dismissed"),
		);
	}

	if (options.typeFilter) {
		query = query.where(eq(reports.targetType, options.typeFilter as "user" | "post" | "comment"));
	}

	const result = await query.orderBy(desc(reports.createdAt)).limit(limit).offset(offset);

	// Get reporter usernames
	const reportsWithUsernames = await Promise.all(
		result.map(async (report) => {
			const reporter = await db
				.select({ username: users.username })
				.from(users)
				.where(eq(users.id, report.reporterId))
				.get();

			return {
				...report,
				reporterUsername: reporter?.username || "Unknown",
			};
		}),
	);

	const totalResult = await db.select({ count: sql<number>`count(*)` }).from(reports).get();

	return {
		reports: reportsWithUsernames,
		total: totalResult?.count || 0,
	};
}

export async function getReport(reportId: string) {
	const report = await db.select().from(reports).where(eq(reports.id, reportId)).get();

	if (!report) {
		throw new Error("Report not found");
	}

	const reporter = await db
		.select({ username: users.username })
		.from(users)
		.where(eq(users.id, report.reporterId))
		.get();

	return {
		...report,
		reporterUsername: reporter?.username || "Unknown",
	};
}

export async function reviewReport(
	reportId: string,
	action: string,
	adminId: string,
	notes?: string,
) {
	const report = await db.select().from(reports).where(eq(reports.id, reportId)).get();

	if (!report) {
		throw new Error("Report not found");
	}

	let status: "pending" | "reviewed" | "actioned" | "dismissed" = "reviewed";
	if (action === "dismiss") {
		status = "dismissed";
	} else if (action === "warn" || action === "remove_content" || action === "ban_user") {
		status = "actioned";
	}

	await db
		.update(reports)
		.set({
			status,
			reviewedBy: adminId,
			reviewedAt: new Date(),
		})
		.where(eq(reports.id, reportId));

	// Create audit log
	await createAuditLog(adminId, "review_report", "report", reportId, { action, notes });

	return { success: true };
}

export async function getDashboardStats() {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users).get();
	const totalPosts = await db.select({ count: sql<number>`count(*)` }).from(posts).get();
	const totalComments = await db.select({ count: sql<number>`count(*)` }).from(comments).get();

	const pendingReports = await db
		.select({ count: sql<number>`count(*)` })
		.from(reports)
		.where(eq(reports.status, "pending"))
		.get();

	const bannedUsers = await db
		.select({ count: sql<number>`count(*)` })
		.from(users)
		.where(sql`${users.bannedAt} IS NOT NULL`)
		.get();

	const newUsersToday = await db
		.select({ count: sql<number>`count(*)` })
		.from(users)
		.where(gte(users.createdAt, today))
		.get();

	const newPostsToday = await db
		.select({ count: sql<number>`count(*)` })
		.from(posts)
		.where(gte(posts.createdAt, today))
		.get();

	return {
		totalUsers: totalUsers?.count || 0,
		totalPosts: totalPosts?.count || 0,
		totalComments: totalComments?.count || 0,
		pendingReports: pendingReports?.count || 0,
		bannedUsers: bannedUsers?.count || 0,
		newUsersToday: newUsersToday?.count || 0,
		newPostsToday: newPostsToday?.count || 0,
	};
}

export async function getAuditLogs(
	options: { limit?: number; offset?: number; adminIdFilter?: string; actionFilter?: string } = {},
) {
	const limit = options.limit || 50;
	const offset = options.offset || 0;

	let query = db
		.select({
			id: auditLogs.id,
			adminId: auditLogs.adminId,
			action: auditLogs.action,
			targetType: auditLogs.targetType,
			targetId: auditLogs.targetId,
			details: auditLogs.details,
			ipAddress: auditLogs.ipAddress,
			createdAt: auditLogs.createdAt,
		})
		.from(auditLogs)
		.$dynamic();

	if (options.adminIdFilter) {
		query = query.where(eq(auditLogs.adminId, options.adminIdFilter));
	}

	if (options.actionFilter) {
		query = query.where(eq(auditLogs.action, options.actionFilter));
	}

	const result = await query.orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);

	// Get admin usernames
	const logsWithUsernames = await Promise.all(
		result.map(async (log) => {
			const admin = await db
				.select({ username: users.username })
				.from(users)
				.where(eq(users.id, log.adminId))
				.get();

			return {
				...log,
				adminUsername: admin?.username || "Unknown",
			};
		}),
	);

	const totalResult = await db.select({ count: sql<number>`count(*)` }).from(auditLogs).get();

	return {
		logs: logsWithUsernames,
		total: totalResult?.count || 0,
	};
}

async function createAuditLog(
	adminId: string,
	action: string,
	targetType?: string,
	targetId?: string,
	details?: Record<string, unknown>,
) {
	await db.insert(auditLogs).values({
		id: generateId(),
		adminId,
		action,
		targetType: targetType as "user" | "post" | "comment" | "report" | undefined,
		targetId,
		details: details ? JSON.stringify(details) : null,
	});
}
