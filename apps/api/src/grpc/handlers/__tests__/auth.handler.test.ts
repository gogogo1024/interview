import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authHandler } from "../auth.handler";

// Mock the auth service
vi.mock("../../../services/auth.service", () => ({
	registerUser: vi.fn(),
	loginUser: vi.fn(),
	getCurrentUser: vi.fn(),
}));

// Mock the auth middleware
vi.mock("../../../middleware/auth", () => ({
	validateSessionToken: vi.fn(),
}));

import { validateSessionToken } from "../../../middleware/auth";
import { getCurrentUser, loginUser, registerUser } from "../../../services/auth.service";

describe("AuthHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe("register", () => {
		it("returns success with userId and sessionToken on successful registration", async () => {
			vi.mocked(registerUser).mockResolvedValue({
				userId: "user-123",
				sessionToken: "token-abc",
			});

			const result = await authHandler.register({
				email: "test@example.com",
				username: "testuser",
				displayName: "Test User",
				password: "password123",
			});

			expect(result.success).toBe(true);
			expect(result.userId).toBe("user-123");
			expect(result.sessionToken).toBe("token-abc");
			expect(registerUser).toHaveBeenCalledWith({
				email: "test@example.com",
				username: "testuser",
				displayName: "Test User",
				password: "password123",
			});
		});

		it("returns error on registration failure", async () => {
			vi.mocked(registerUser).mockRejectedValue(new Error("Email already exists"));

			const result = await authHandler.register({
				email: "test@example.com",
				username: "testuser",
				displayName: "Test User",
				password: "password123",
			});

			expect(result.success).toBe(false);
			expect(result.userId).toBe("");
			expect(result.sessionToken).toBe("");
			expect(result.error).toBe("Email already exists");
		});

		it("handles non-Error exceptions", async () => {
			vi.mocked(registerUser).mockRejectedValue("Unknown error");

			const result = await authHandler.register({
				email: "test@example.com",
				username: "testuser",
				displayName: "Test User",
				password: "password123",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Registration failed");
		});
	});

	describe("login", () => {
		it("returns success with userId and sessionToken on successful login", async () => {
			vi.mocked(loginUser).mockResolvedValue({
				userId: "user-123",
				sessionToken: "token-xyz",
			});

			const result = await authHandler.login({
				email: "test@example.com",
				password: "password123",
			});

			expect(result.success).toBe(true);
			expect(result.userId).toBe("user-123");
			expect(result.sessionToken).toBe("token-xyz");
			expect(loginUser).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
			});
		});

		it("returns error on invalid credentials", async () => {
			vi.mocked(loginUser).mockRejectedValue(new Error("Invalid credentials"));

			const result = await authHandler.login({
				email: "test@example.com",
				password: "wrongpassword",
			});

			expect(result.success).toBe(false);
			expect(result.userId).toBe("");
			expect(result.sessionToken).toBe("");
			expect(result.error).toBe("Invalid credentials");
		});

		it("handles non-Error exceptions", async () => {
			vi.mocked(loginUser).mockRejectedValue("Unknown error");

			const result = await authHandler.login({
				email: "test@example.com",
				password: "password123",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Login failed");
		});
	});

	describe("logout", () => {
		it("always returns success for logout", async () => {
			const result = await authHandler.logout({ sessionToken: "any-token" });

			expect(result.success).toBe(true);
		});
	});

	describe("getCurrentUser", () => {
		it("returns user data for valid session", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(getCurrentUser).mockResolvedValue({
				id: "user-123",
				email: "test@example.com",
				username: "testuser",
				displayName: "Test User",
				avatarUrl: "https://example.com/avatar.jpg",
				bio: "Hello world",
				role: "user",
				createdAt: new Date("2024-01-01"),
			});

			const result = await authHandler.getCurrentUser({ sessionToken: "valid-token" });

			expect(result.id).toBe("user-123");
			expect(result.email).toBe("test@example.com");
			expect(result.username).toBe("testuser");
			expect(result.displayName).toBe("Test User");
			expect(result.avatarUrl).toBe("https://example.com/avatar.jpg");
			expect(result.bio).toBe("Hello world");
			expect(result.role).toBe("user");
		});

		it("handles null avatarUrl and bio", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(getCurrentUser).mockResolvedValue({
				id: "user-123",
				email: "test@example.com",
				username: "testuser",
				displayName: "Test User",
				avatarUrl: null,
				bio: null,
				role: "user",
				createdAt: new Date("2024-01-01"),
			});

			const result = await authHandler.getCurrentUser({ sessionToken: "valid-token" });

			expect(result.avatarUrl).toBeUndefined();
			expect(result.bio).toBeUndefined();
		});

		it("throws error for invalid session token", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid or expired session token");
			});

			await expect(authHandler.getCurrentUser({ sessionToken: "invalid-token" })).rejects.toThrow(
				"Invalid or expired session token",
			);
		});

		it("throws error when user not found", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(getCurrentUser).mockRejectedValue(new Error("User not found"));

			await expect(authHandler.getCurrentUser({ sessionToken: "valid-token" })).rejects.toThrow(
				"User not found",
			);
		});
	});

	describe("validateSession", () => {
		it("returns valid response for valid token", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "admin",
			});

			const result = await authHandler.validateSession({ sessionToken: "valid-token" });

			expect(result.valid).toBe(true);
			expect(result.userId).toBe("user-123");
			expect(result.username).toBe("testuser");
			expect(result.role).toBe("admin");
		});

		it("returns invalid response for expired token", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Token expired");
			});

			const result = await authHandler.validateSession({ sessionToken: "expired-token" });

			expect(result.valid).toBe(false);
			expect(result.userId).toBe("");
			expect(result.username).toBe("");
			expect(result.role).toBe("");
		});

		it("returns invalid response for malformed token", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid token");
			});

			const result = await authHandler.validateSession({ sessionToken: "malformed" });

			expect(result.valid).toBe(false);
		});
	});
});
