import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

// Users table with role-based admin support
export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	username: text("username").notNull().unique(),
	displayName: text("display_name").notNull(),
	avatarUrl: text("avatar_url"),
	bio: text("bio"),
	passwordHash: text("password_hash").notNull(),
	// Role-based access control
	role: text("role", { enum: ["user", "admin", "moderator"] })
		.notNull()
		.default("user"),
	// Ban status
	bannedAt: integer("banned_at", { mode: "timestamp" }),
	bannedReason: text("banned_reason"),
	bannedBy: text("banned_by"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Posts table
export const posts = sqliteTable("posts", {
	id: text("id").primaryKey(),
	content: text("content").notNull(),
	authorId: text("author_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Comments table
export const comments = sqliteTable("comments", {
	id: text("id").primaryKey(),
	content: text("content").notNull(),
	postId: text("post_id")
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	authorId: text("author_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	// biome-ignore lint/suspicious/noExplicitAny: self-reference requires any
	parentId: text("parent_id").references((): any => comments.id, { onDelete: "cascade" }),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Likes table
export const likes = sqliteTable(
	"likes",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		postId: text("post_id").references(() => posts.id, { onDelete: "cascade" }),
		commentId: text("comment_id").references(() => comments.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
	},
	(table) => ({
		uniquePostLike: unique().on(table.userId, table.postId),
		uniqueCommentLike: unique().on(table.userId, table.commentId),
	}),
);

// Follows table
export const follows = sqliteTable(
	"follows",
	{
		id: text("id").primaryKey(),
		followerId: text("follower_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		followingId: text("following_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
	},
	(table) => ({
		uniqueFollow: unique().on(table.followerId, table.followingId),
	}),
);

// Bookmarks table
export const bookmarks = sqliteTable(
	"bookmarks",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		postId: text("post_id")
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
	},
	(table) => ({
		uniqueBookmark: unique().on(table.userId, table.postId),
	}),
);

// Notifications table
export const notifications = sqliteTable("notifications", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	type: text("type").notNull(),
	actorId: text("actor_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	postId: text("post_id").references(() => posts.id, { onDelete: "cascade" }),
	commentId: text("comment_id").references(() => comments.id, { onDelete: "cascade" }),
	read: integer("read", { mode: "boolean" }).notNull().default(false),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Reports table for content moderation
export const reports = sqliteTable("reports", {
	id: text("id").primaryKey(),
	reporterId: text("reporter_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	targetType: text("target_type", { enum: ["post", "comment", "user"] }).notNull(),
	targetId: text("target_id").notNull(),
	reason: text("reason").notNull(),
	description: text("description"),
	status: text("status", { enum: ["pending", "reviewed", "actioned", "dismissed"] })
		.notNull()
		.default("pending"),
	reviewedBy: text("reviewed_by").references(() => users.id),
	reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Audit logs table for admin actions
export const auditLogs = sqliteTable("audit_logs", {
	id: text("id").primaryKey(),
	adminId: text("admin_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	action: text("action").notNull(),
	targetType: text("target_type", { enum: ["user", "post", "comment", "report"] }),
	targetId: text("target_id"),
	details: text("details"), // JSON string for additional details
	ipAddress: text("ip_address"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type InsertLike = typeof likes.$inferInsert;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = typeof bookmarks.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// Role type
export type UserRole = "user" | "admin" | "moderator";
