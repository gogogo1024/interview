import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the session module
vi.mock("../../../src/lib/session.server", () => ({
	setAdminSessionData: vi.fn(),
	clearAdminSessionData: vi.fn(),
	getAdminSessionData: vi.fn(),
}));

// Mock the grpc module
vi.mock("../../../src/lib/grpc.server", () => ({
	getGrpcClient: vi.fn(),
	getAdminGrpcSessionToken: vi.fn(),
	fromProtoTimestamp: vi.fn((ts: { seconds: number } | undefined) =>
		ts ? new Date(ts.seconds * 1000) : undefined,
	),
}));

// Mock tanstack-start to allow calling server functions in tests
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		inputValidator: () => ({
			handler: <T>(fn: (ctx: { data: unknown }) => Promise<T>) => {
				const callable = (data: unknown) => fn({ data });
				callable.handler = fn;
				return callable;
			},
		}),
		handler: <T>(fn: (ctx: { data: unknown }) => Promise<T>) => {
			const callable = () => fn({ data: undefined });
			callable.handler = fn;
			return callable;
		},
	}),
}));

import { getAdminGrpcSessionToken, getGrpcClient } from "../../../src/lib/grpc.server";
import {
	clearAdminSessionData,
	getAdminSessionData,
	setAdminSessionData,
} from "../../../src/lib/session.server";
import {
	checkAdminAuth,
	getCurrentAdmin,
	loginAdmin,
	logoutAdmin,
} from "../../../src/server/functions/auth";

// Type assertion helpers for calling server functions
type LoginResult = { success: boolean; userId: string; role: string };
type LogoutResult = { success: boolean };
type CurrentAdminResult = {
	id: string;
	email: string;
	username: string;
	displayName: string;
	avatarUrl: string;
	role: string;
	createdAt: Date | undefined;
} | null;
type CheckAuthResult = { isAuthenticated: boolean; role: string | null };

const callLoginAdmin = loginAdmin as unknown as (data: {
	email: string;
	password: string;
}) => Promise<LoginResult>;
const callLogoutAdmin = logoutAdmin as unknown as () => Promise<LogoutResult>;
const callGetCurrentAdmin = getCurrentAdmin as unknown as () => Promise<CurrentAdminResult>;
const callCheckAdminAuth = checkAdminAuth as unknown as () => Promise<CheckAuthResult>;

describe("Admin Auth Server Functions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe("loginAdmin", () => {
		it("successfully logs in admin user", async () => {
			const mockClient = {
				auth: {
					login: vi.fn().mockResolvedValue({
						response: {
							success: true,
							sessionToken: "session-token-123",
							userId: "user-123",
						},
					}),
					validateSession: vi.fn().mockResolvedValue({
						response: {
							valid: true,
							username: "adminuser",
							role: "admin",
						},
					}),
					logout: vi.fn(),
				},
			};

			vi.mocked(getGrpcClient).mockReturnValue(mockClient as any);
			vi.mocked(setAdminSessionData).mockResolvedValue(undefined);

			const result = await callLoginAdmin({ email: "admin@example.com", password: "password123" });

			expect(result.success).toBe(true);
			expect(result.userId).toBe("user-123");
			expect(result.role).toBe("admin");
			expect(setAdminSessionData).toHaveBeenCalledWith({
				userId: "user-123",
				username: "adminuser",
				role: "admin",
			});
		});

		it("successfully logs in moderator user", async () => {
			const mockClient = {
				auth: {
					login: vi.fn().mockResolvedValue({
						response: {
							success: true,
							sessionToken: "session-token-123",
							userId: "user-456",
						},
					}),
					validateSession: vi.fn().mockResolvedValue({
						response: {
							valid: true,
							username: "moduser",
							role: "moderator",
						},
					}),
				},
			};

			vi.mocked(getGrpcClient).mockReturnValue(mockClient as any);
			vi.mocked(setAdminSessionData).mockResolvedValue(undefined);

			const result = await callLoginAdmin({ email: "mod@example.com", password: "password123" });

			expect(result.success).toBe(true);
			expect(result.role).toBe("moderator");
		});

		it("rejects regular user login", async () => {
			const mockClient = {
				auth: {
					login: vi.fn().mockResolvedValue({
						response: {
							success: true,
							sessionToken: "session-token-123",
							userId: "user-789",
						},
					}),
					validateSession: vi.fn().mockResolvedValue({
						response: {
							valid: true,
							username: "regularuser",
							role: "user",
						},
					}),
					logout: vi.fn().mockResolvedValue({ response: { success: true } }),
				},
			};

			vi.mocked(getGrpcClient).mockReturnValue(mockClient as any);

			await expect(
				callLoginAdmin({ email: "user@example.com", password: "password123" }),
			).rejects.toThrow("Access denied. Admin or moderator role required.");

			// Should logout the session after rejecting
			expect(mockClient.auth.logout).toHaveBeenCalledWith({
				sessionToken: "session-token-123",
			});
		});

		it("throws error for invalid credentials", async () => {
			const mockClient = {
				auth: {
					login: vi.fn().mockResolvedValue({
						response: {
							success: false,
							error: "Invalid email or password",
						},
					}),
				},
			};

			vi.mocked(getGrpcClient).mockReturnValue(mockClient as any);

			await expect(
				callLoginAdmin({ email: "wrong@example.com", password: "wrongpass" }),
			).rejects.toThrow("Invalid email or password");
		});

		it("throws error when session validation fails", async () => {
			const mockClient = {
				auth: {
					login: vi.fn().mockResolvedValue({
						response: {
							success: true,
							sessionToken: "session-token-123",
							userId: "user-123",
						},
					}),
					validateSession: vi.fn().mockResolvedValue({
						response: {
							valid: false,
						},
					}),
				},
			};

			vi.mocked(getGrpcClient).mockReturnValue(mockClient as any);

			await expect(
				callLoginAdmin({ email: "admin@example.com", password: "password123" }),
			).rejects.toThrow("Failed to validate session");
		});
	});

	describe("logoutAdmin", () => {
		it("successfully logs out when session exists", async () => {
			vi.mocked(getAdminGrpcSessionToken).mockResolvedValue("session-token-123");

			const mockClient = {
				auth: {
					logout: vi.fn().mockResolvedValue({ response: { success: true } }),
				},
			};

			vi.mocked(getGrpcClient).mockReturnValue(mockClient as any);
			vi.mocked(clearAdminSessionData).mockResolvedValue(undefined);

			const result = await callLogoutAdmin();

			expect(result.success).toBe(true);
			expect(mockClient.auth.logout).toHaveBeenCalledWith({ sessionToken: "session-token-123" });
			expect(clearAdminSessionData).toHaveBeenCalled();
		});

		it("clears session even without token", async () => {
			vi.mocked(getAdminGrpcSessionToken).mockResolvedValue(undefined as unknown as string);
			vi.mocked(clearAdminSessionData).mockResolvedValue(undefined);

			const result = await callLogoutAdmin();

			expect(result.success).toBe(true);
			expect(clearAdminSessionData).toHaveBeenCalled();
		});
	});

	describe("getCurrentAdmin", () => {
		it("returns admin user data when session is valid", async () => {
			vi.mocked(getAdminSessionData).mockResolvedValue({
				userId: "user-123",
				username: "adminuser",
				role: "admin",
			});
			vi.mocked(getAdminGrpcSessionToken).mockResolvedValue("session-token-123");

			const mockClient = {
				auth: {
					getCurrentUser: vi.fn().mockResolvedValue({
						response: {
							id: "user-123",
							email: "admin@example.com",
							username: "adminuser",
							displayName: "Admin User",
							avatarUrl: "https://example.com/avatar.jpg",
							role: "admin",
							createdAt: { seconds: 1704067200, nanos: 0 },
						},
					}),
				},
			};

			vi.mocked(getGrpcClient).mockReturnValue(mockClient as any);

			const result = await callGetCurrentAdmin();

			expect(result).not.toBeNull();
			expect(result?.id).toBe("user-123");
			expect(result?.email).toBe("admin@example.com");
			expect(result?.role).toBe("admin");
		});

		it("returns null when no session exists", async () => {
			vi.mocked(getAdminSessionData).mockResolvedValue(undefined as unknown as null);

			const result = await callGetCurrentAdmin();

			expect(result).toBeNull();
		});

		it("returns null and clears session when token is missing", async () => {
			vi.mocked(getAdminSessionData).mockResolvedValue({
				userId: "user-123",
				username: "adminuser",
				role: "admin",
			});
			vi.mocked(getAdminGrpcSessionToken).mockResolvedValue(undefined as unknown as string);
			vi.mocked(clearAdminSessionData).mockResolvedValue(undefined);

			const result = await callGetCurrentAdmin();

			expect(result).toBeNull();
			expect(clearAdminSessionData).toHaveBeenCalled();
		});

		it("returns null and clears session when user is no longer admin", async () => {
			vi.mocked(getAdminSessionData).mockResolvedValue({
				userId: "user-123",
				username: "adminuser",
				role: "admin",
			});
			vi.mocked(getAdminGrpcSessionToken).mockResolvedValue("session-token-123");

			const mockClient = {
				auth: {
					getCurrentUser: vi.fn().mockResolvedValue({
						response: {
							id: "user-123",
							email: "admin@example.com",
							username: "adminuser",
							displayName: "Admin User",
							role: "user", // Demoted to regular user
							createdAt: { seconds: 1704067200, nanos: 0 },
						},
					}),
				},
			};

			vi.mocked(getGrpcClient).mockReturnValue(mockClient as any);
			vi.mocked(clearAdminSessionData).mockResolvedValue(undefined);

			const result = await callGetCurrentAdmin();

			expect(result).toBeNull();
			expect(clearAdminSessionData).toHaveBeenCalled();
		});

		it("returns null and clears session on API error", async () => {
			vi.mocked(getAdminSessionData).mockResolvedValue({
				userId: "user-123",
				username: "adminuser",
				role: "admin",
			});
			vi.mocked(getAdminGrpcSessionToken).mockResolvedValue("session-token-123");

			const mockClient = {
				auth: {
					getCurrentUser: vi.fn().mockRejectedValue(new Error("API error")),
				},
			};

			vi.mocked(getGrpcClient).mockReturnValue(mockClient as any);
			vi.mocked(clearAdminSessionData).mockResolvedValue(undefined);

			const result = await callGetCurrentAdmin();

			expect(result).toBeNull();
			expect(clearAdminSessionData).toHaveBeenCalled();
		});
	});

	describe("checkAdminAuth", () => {
		it("returns authenticated when session exists", async () => {
			vi.mocked(getAdminSessionData).mockResolvedValue({
				userId: "user-123",
				username: "adminuser",
				role: "admin",
			});

			const result = await callCheckAdminAuth();

			expect(result.isAuthenticated).toBe(true);
			expect(result.role).toBe("admin");
		});

		it("returns not authenticated when no session", async () => {
			vi.mocked(getAdminSessionData).mockResolvedValue(undefined as unknown as null);

			const result = await callCheckAdminAuth();

			expect(result.isAuthenticated).toBe(false);
			expect(result.role).toBeNull();
		});

		it("returns moderator role correctly", async () => {
			vi.mocked(getAdminSessionData).mockResolvedValue({
				userId: "user-456",
				username: "moduser",
				role: "moderator",
			});

			const result = await callCheckAdminAuth();

			expect(result.isAuthenticated).toBe(true);
			expect(result.role).toBe("moderator");
		});
	});
});
