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

function toAdminUserResponse(user: any): AdminUserResponse {
	return {
		id: user.id,
		email: user.email,
		username: user.username,
		displayName: user.displayName,
		avatarUrl: user.avatarUrl || undefined,
		bio: user.bio || undefined,
		role: user.role,
		createdAt: toProtoTimestamp(user.createdAt),
		updatedAt: toProtoTimestamp(user.updatedAt),
		bannedAt: user.bannedAt ? toProtoTimestamp(user.bannedAt) : undefined,
		bannedReason: user.bannedReason || undefined,
		postCount: user.postCount || 0,
		commentCount: user.commentCount || 0,
	};
}

function toReportResponse(report: any): ReportResponse {
	return {
		id: report.id,
		reporterId: report.reporterId,
		reporterUsername: report.reporterUsername,
		targetType: report.targetType,
		targetId: report.targetId,
		reason: report.reason,
		description: report.description || undefined,
		status: report.status,
		reviewedBy: report.reviewedBy || undefined,
		reviewedAt: report.reviewedAt ? toProtoTimestamp(report.reviewedAt) : undefined,
		createdAt: toProtoTimestamp(report.createdAt),
	};
}

function toAuditLogResponse(log: any): AuditLogResponse {
	return {
		id: log.id,
		adminId: log.adminId,
		adminUsername: log.adminUsername,
		action: log.action,
		targetType: log.targetType || undefined,
		targetId: log.targetId || undefined,
		details: log.details || undefined,
		ipAddress: log.ipAddress || undefined,
		createdAt: toProtoTimestamp(log.createdAt),
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
