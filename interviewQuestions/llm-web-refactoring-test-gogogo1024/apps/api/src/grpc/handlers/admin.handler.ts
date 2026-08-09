import type {
	AdminUserResponse,
	AuditLogResponse,
	IAdminService,
	ReportResponse,
} from "@chirp/proto";
import { requireAdmin, validateSessionToken } from "../../middleware/auth";
import {
	banUser,
	deleteCommentAdmin,
	deletePostAdmin,
	deleteUser,
	getAuditLogs,
	getDashboardStats,
	getReport,
	getUserDetails,
	listReports,
	listUsers,
	reviewReport,
	unbanUser,
	updateUserRole,
} from "../../services/admin.service";
import { toProtoTimestamp } from "../../services/utils";

function toAdminUserResponse(user: unknown): AdminUserResponse {
	const u = user as {
		id: string;
		email: string;
		username: string;
		displayName?: string;
		avatarUrl?: string | null;
		bio?: string | null;
		role: string;
		createdAt: string | number | Date;
		updatedAt: string | number | Date;
		bannedAt?: string | number | Date | null;
		bannedReason?: string | null;
		postCount?: number;
		commentCount?: number;
	};

	return {
		id: u.id,
		email: u.email,
		username: u.username,
		displayName: u.displayName || "",
		avatarUrl: u.avatarUrl || undefined,
		bio: u.bio || undefined,
		role: u.role,
		createdAt: toProtoTimestamp(new Date(u.createdAt)),
		updatedAt: toProtoTimestamp(new Date(u.updatedAt)),
		bannedAt: u.bannedAt ? toProtoTimestamp(new Date(u.bannedAt)) : undefined,
		bannedReason: u.bannedReason || undefined,
		postCount: u.postCount || 0,
		commentCount: u.commentCount || 0,
	};
}

function toReportResponse(report: unknown): ReportResponse {
	const r = report as {
		id: string;
		reporterId: string;
		reporterUsername?: string;
		targetType: string;
		targetId: string;
		reason: string;
		description?: string | null;
		status: string;
		reviewedBy?: string | null;
		reviewedAt?: string | number | Date | null;
		createdAt: string | number | Date;
	};

	return {
		id: r.id,
		reporterId: r.reporterId,
		reporterUsername: r.reporterUsername || "",
		targetType: r.targetType,
		targetId: r.targetId,
		reason: r.reason,
		description: r.description || undefined,
		status: r.status,
		reviewedBy: r.reviewedBy || undefined,
		reviewedAt: r.reviewedAt ? toProtoTimestamp(new Date(r.reviewedAt)) : undefined,
		createdAt: toProtoTimestamp(new Date(r.createdAt)),
	};
}

function toAuditLogResponse(log: unknown): AuditLogResponse {
	const l = log as {
		id: string;
		adminId: string;
		adminUsername?: string;
		action: string;
		targetType?: string | null;
		targetId?: string | null;
		details?: string | null;
		ipAddress?: string | null;
		createdAt: string | number | Date;
	};

	return {
		id: l.id,
		adminId: l.adminId,
		adminUsername: l.adminUsername || "",
		action: l.action,
		targetType: l.targetType || undefined,
		targetId: l.targetId || undefined,
		details: l.details || undefined,
		ipAddress: l.ipAddress || undefined,
		createdAt: toProtoTimestamp(new Date(l.createdAt)),
	};
}

export const adminHandler: IAdminService = {
	async listUsers(request) {
		const auth = validateSessionToken(request.sessionToken);
		requireAdmin(auth);

		const result = await listUsers({
			limit: request.pagination?.limit || 20,
			offset: request.pagination?.offset || 0,
			searchQuery: request.searchQuery || undefined,
			roleFilter: request.roleFilter || undefined,
		});

		return {
			users: result.users.map(toAdminUserResponse),
			total: result.total,
		};
	},

	async getUserDetails(request) {
		const auth = validateSessionToken(request.sessionToken);
		requireAdmin(auth);

		const user = await getUserDetails(request.userId);

		return {
			user: toAdminUserResponse(user),
		};
	},

	async banUser(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			requireAdmin(auth);

			await banUser(request.userId, request.reason, auth.userId);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to ban user",
			};
		}
	},

	async unbanUser(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			requireAdmin(auth);

			await unbanUser(request.userId, auth.userId);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to unban user",
			};
		}
	},

	async updateUserRole(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			requireAdmin(auth);

			await updateUserRole(request.userId, request.role, auth.userId);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to update role",
			};
		}
	},

	async deleteUser(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			requireAdmin(auth);

			await deleteUser(request.userId, auth.userId);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to delete user",
			};
		}
	},

	async deletePostAdmin(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			requireAdmin(auth);

			await deletePostAdmin(request.postId, request.reason, auth.userId);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to delete post",
			};
		}
	},

	async deleteCommentAdmin(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			requireAdmin(auth);

			await deleteCommentAdmin(request.commentId, request.reason, auth.userId);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to delete comment",
			};
		}
	},

	async listReports(request) {
		const auth = validateSessionToken(request.sessionToken);
		requireAdmin(auth);

		const result = await listReports({
			limit: request.pagination?.limit || 20,
			offset: request.pagination?.offset || 0,
			statusFilter: request.statusFilter || undefined,
			typeFilter: request.typeFilter || undefined,
		});

		return {
			reports: result.reports.map(toReportResponse),
			total: result.total,
		};
	},

	async getReport(request) {
		const auth = validateSessionToken(request.sessionToken);
		requireAdmin(auth);

		const report = await getReport(request.reportId);

		return toReportResponse(report);
	},

	async reviewReport(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			requireAdmin(auth);

			await reviewReport(request.reportId, request.action, auth.userId, request.notes || undefined);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to review report",
			};
		}
	},

	async getDashboardStats(request) {
		const auth = validateSessionToken(request.sessionToken);
		requireAdmin(auth);

		const stats = await getDashboardStats();

		return {
			totalUsers: stats.totalUsers,
			totalPosts: stats.totalPosts,
			totalComments: stats.totalComments,
			pendingReports: stats.pendingReports,
			newUsersToday: stats.newUsersToday,
			newPostsToday: stats.newPostsToday,
			bannedUsers: stats.bannedUsers,
		};
	},

	async getAuditLogs(request) {
		const auth = validateSessionToken(request.sessionToken);
		requireAdmin(auth);

		const result = await getAuditLogs({
			limit: request.pagination?.limit || 50,
			offset: request.pagination?.offset || 0,
			adminIdFilter: request.adminIdFilter || undefined,
			actionFilter: request.actionFilter || undefined,
		});

		return {
			logs: result.logs.map(toAuditLogResponse),
			total: result.total,
		};
	},
};
