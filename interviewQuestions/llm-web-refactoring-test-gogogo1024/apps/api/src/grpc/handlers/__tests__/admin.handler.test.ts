import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { adminHandler } from "../admin.handler";

// Mock the admin service
vi.mock("../../../services/admin.service", () => ({
	listUsers: vi.fn(),
	getUserDetails: vi.fn(),
	banUser: vi.fn(),
	unbanUser: vi.fn(),
	updateUserRole: vi.fn(),
	deleteUser: vi.fn(),
	deletePostAdmin: vi.fn(),
	deleteCommentAdmin: vi.fn(),
	listReports: vi.fn(),
	getReport: vi.fn(),
	reviewReport: vi.fn(),
	getDashboardStats: vi.fn(),
	getAuditLogs: vi.fn(),
}));

// Mock the auth middleware
vi.mock("../../../middleware/auth", () => ({
	validateSessionToken: vi.fn(),
	requireAdmin: vi.fn(),
}));

import { requireAdmin, validateSessionToken } from "../../../middleware/auth";
import {
	banUser,
	deleteCommentAdmin,
	deletePostAdmin,
	deleteUser,
	getAuditLogs,
	getDashboardStats,
	listReports,
	listUsers,
	reviewReport,
	unbanUser,
	updateUserRole,
} from "../../../services/admin.service";

describe("AdminHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	const mockAdminAuth = () => {
		vi.mocked(validateSessionToken).mockReturnValue({
			userId: "admin-123",
			username: "admin",
			role: "admin",
		});
		vi.mocked(requireAdmin).mockReturnValue(undefined);
	};

	const mockUserAuth = () => {
		vi.mocked(validateSessionToken).mockReturnValue({
			userId: "user-123",
			username: "testuser",
			role: "user",
		});
		vi.mocked(requireAdmin).mockImplementation(() => {
			throw new Error("Admin access required");
		});
	};

	describe("listUsers", () => {
		const mockUsers = [
			{
				id: "user-1",
				email: "user1@example.com",
				username: "user1",
				displayName: "User One",
				avatarUrl: null,
				bio: null,
				role: "user" as const,
				createdAt: new Date(),
				updatedAt: new Date(),
				bannedAt: null,
				bannedReason: null,
				postCount: 10,
				commentCount: 20,
			},
		];

		it("returns users for admin", async () => {
			mockAdminAuth();
			vi.mocked(listUsers).mockResolvedValue({ users: mockUsers, total: 1 });

			const result = await adminHandler.listUsers({
				sessionToken: "admin-token",
			});

			expect(result.users).toHaveLength(1);
			expect(result.total).toBe(1);
			expect(listUsers).toHaveBeenCalledWith({
				limit: 20,
				offset: 0,
				searchQuery: undefined,
				roleFilter: undefined,
			});
		});

		it("supports pagination and filters", async () => {
			mockAdminAuth();
			vi.mocked(listUsers).mockResolvedValue({ users: mockUsers, total: 100 });

			await adminHandler.listUsers({
				sessionToken: "admin-token",
				pagination: { limit: 10, offset: 20 },
				searchQuery: "test",
				roleFilter: "admin",
			});

			expect(listUsers).toHaveBeenCalledWith({
				limit: 10,
				offset: 20,
				searchQuery: "test",
				roleFilter: "admin",
			});
		});

		it("throws error for non-admin users", async () => {
			mockUserAuth();

			await expect(adminHandler.listUsers({ sessionToken: "user-token" })).rejects.toThrow(
				"Admin access required",
			);
		});
	});

	describe("banUser", () => {
		it("bans user successfully", async () => {
			mockAdminAuth();
			vi.mocked(banUser).mockResolvedValue({ success: true });

			const result = await adminHandler.banUser({
				sessionToken: "admin-token",
				userId: "user-456",
				reason: "Violation of terms",
			});

			expect(result.success).toBe(true);
			expect(banUser).toHaveBeenCalledWith("user-456", "Violation of terms", "admin-123");
		});

		it("returns error when ban fails", async () => {
			mockAdminAuth();
			vi.mocked(banUser).mockRejectedValue(new Error("Cannot ban admin users"));

			const result = await adminHandler.banUser({
				sessionToken: "admin-token",
				userId: "admin-456",
				reason: "Test",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Cannot ban admin users");
		});

		it("returns error for non-admin users", async () => {
			mockUserAuth();

			const result = await adminHandler.banUser({
				sessionToken: "user-token",
				userId: "user-456",
				reason: "Test",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Admin access required");
		});
	});

	describe("unbanUser", () => {
		it("unbans user successfully", async () => {
			mockAdminAuth();
			vi.mocked(unbanUser).mockResolvedValue({ success: true });

			const result = await adminHandler.unbanUser({
				sessionToken: "admin-token",
				userId: "user-456",
			});

			expect(result.success).toBe(true);
			expect(unbanUser).toHaveBeenCalledWith("user-456", "admin-123");
		});

		it("returns error when unban fails", async () => {
			mockAdminAuth();
			vi.mocked(unbanUser).mockRejectedValue(new Error("User is not banned"));

			const result = await adminHandler.unbanUser({
				sessionToken: "admin-token",
				userId: "user-456",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("User is not banned");
		});
	});

	describe("updateUserRole", () => {
		it("updates user role successfully", async () => {
			mockAdminAuth();
			vi.mocked(updateUserRole).mockResolvedValue({ success: true });

			const result = await adminHandler.updateUserRole({
				sessionToken: "admin-token",
				userId: "user-456",
				role: "moderator",
			});

			expect(result.success).toBe(true);
			expect(updateUserRole).toHaveBeenCalledWith("user-456", "moderator", "admin-123");
		});

		it("returns error for invalid role", async () => {
			mockAdminAuth();
			vi.mocked(updateUserRole).mockRejectedValue(new Error("Invalid role"));

			const result = await adminHandler.updateUserRole({
				sessionToken: "admin-token",
				userId: "user-456",
				role: "invalid",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Invalid role");
		});
	});

	describe("deleteUser", () => {
		it("deletes user successfully", async () => {
			mockAdminAuth();
			vi.mocked(deleteUser).mockResolvedValue({ success: true });

			const result = await adminHandler.deleteUser({
				sessionToken: "admin-token",
				userId: "user-456",
			});

			expect(result.success).toBe(true);
			expect(deleteUser).toHaveBeenCalledWith("user-456", "admin-123");
		});

		it("returns error when delete fails", async () => {
			mockAdminAuth();
			vi.mocked(deleteUser).mockRejectedValue(new Error("Cannot delete admin"));

			const result = await adminHandler.deleteUser({
				sessionToken: "admin-token",
				userId: "admin-456",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Cannot delete admin");
		});
	});

	describe("deletePostAdmin", () => {
		it("deletes post as admin successfully", async () => {
			mockAdminAuth();
			vi.mocked(deletePostAdmin).mockResolvedValue({ success: true });

			const result = await adminHandler.deletePostAdmin({
				sessionToken: "admin-token",
				postId: "post-456",
				reason: "Spam content",
			});

			expect(result.success).toBe(true);
			expect(deletePostAdmin).toHaveBeenCalledWith("post-456", "Spam content", "admin-123");
		});
	});

	describe("deleteCommentAdmin", () => {
		it("deletes comment as admin successfully", async () => {
			mockAdminAuth();
			vi.mocked(deleteCommentAdmin).mockResolvedValue({ success: true });

			const result = await adminHandler.deleteCommentAdmin({
				sessionToken: "admin-token",
				commentId: "comment-456",
				reason: "Harassment",
			});

			expect(result.success).toBe(true);
			expect(deleteCommentAdmin).toHaveBeenCalledWith("comment-456", "Harassment", "admin-123");
		});
	});

	describe("listReports", () => {
		const mockReports = [
			{
				id: "report-1",
				reporterId: "user-1",
				reporterUsername: "reporter",
				targetType: "post" as const,
				targetId: "post-1",
				reason: "spam",
				description: "This is spam",
				status: "pending" as const,
				reviewedBy: null,
				reviewedAt: null,
				createdAt: new Date(),
			},
		];

		it("returns reports for admin", async () => {
			mockAdminAuth();
			vi.mocked(listReports).mockResolvedValue({ reports: mockReports, total: 1 });

			const result = await adminHandler.listReports({
				sessionToken: "admin-token",
			});

			expect(result.reports).toHaveLength(1);
			expect(result.total).toBe(1);
		});

		it("supports filters", async () => {
			mockAdminAuth();
			vi.mocked(listReports).mockResolvedValue({ reports: mockReports, total: 1 });

			await adminHandler.listReports({
				sessionToken: "admin-token",
				statusFilter: "pending",
				typeFilter: "post",
			});

			expect(listReports).toHaveBeenCalledWith({
				limit: 20,
				offset: 0,
				statusFilter: "pending",
				typeFilter: "post",
			});
		});
	});

	describe("reviewReport", () => {
		it("reviews report successfully", async () => {
			mockAdminAuth();
			vi.mocked(reviewReport).mockResolvedValue({ success: true });

			const result = await adminHandler.reviewReport({
				sessionToken: "admin-token",
				reportId: "report-123",
				action: "dismissed",
				notes: "Not a violation",
			});

			expect(result.success).toBe(true);
			expect(reviewReport).toHaveBeenCalledWith(
				"report-123",
				"dismissed",
				"admin-123",
				"Not a violation",
			);
		});
	});

	describe("getDashboardStats", () => {
		const mockStats = {
			totalUsers: 1000,
			totalPosts: 5000,
			totalComments: 10000,
			pendingReports: 25,
			newUsersToday: 50,
			newPostsToday: 200,
			bannedUsers: 15,
		};

		it("returns dashboard stats for admin", async () => {
			mockAdminAuth();
			vi.mocked(getDashboardStats).mockResolvedValue(mockStats);

			const result = await adminHandler.getDashboardStats({
				sessionToken: "admin-token",
			});

			expect(result.totalUsers).toBe(1000);
			expect(result.totalPosts).toBe(5000);
			expect(result.pendingReports).toBe(25);
			expect(result.bannedUsers).toBe(15);
		});

		it("throws error for non-admin users", async () => {
			mockUserAuth();

			await expect(adminHandler.getDashboardStats({ sessionToken: "user-token" })).rejects.toThrow(
				"Admin access required",
			);
		});
	});

	describe("getAuditLogs", () => {
		const mockLogs = [
			{
				id: "log-1",
				adminId: "admin-123",
				adminUsername: "admin",
				action: "ban_user",
				targetType: "user" as const,
				targetId: "user-456",
				details: "Banned for spam",
				ipAddress: "127.0.0.1",
				createdAt: new Date(),
			},
		];

		it("returns audit logs for admin", async () => {
			mockAdminAuth();
			vi.mocked(getAuditLogs).mockResolvedValue({ logs: mockLogs, total: 1 });

			const result = await adminHandler.getAuditLogs({
				sessionToken: "admin-token",
			});

			expect(result.logs).toHaveLength(1);
			expect(result.logs[0].action).toBe("ban_user");
		});

		it("supports filters", async () => {
			mockAdminAuth();
			vi.mocked(getAuditLogs).mockResolvedValue({ logs: mockLogs, total: 1 });

			await adminHandler.getAuditLogs({
				sessionToken: "admin-token",
				adminIdFilter: "admin-123",
				actionFilter: "ban_user",
			});

			expect(getAuditLogs).toHaveBeenCalledWith({
				limit: 50,
				offset: 0,
				adminIdFilter: "admin-123",
				actionFilter: "ban_user",
			});
		});
	});
});
