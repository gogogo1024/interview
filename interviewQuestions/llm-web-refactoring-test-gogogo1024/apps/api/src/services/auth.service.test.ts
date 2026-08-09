import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createTestUser } from "../../tests/helpers";
import { db, schema } from "../db";
import { getCurrentUser, loginUser, registerUser } from "./auth.service";

const { users } = schema;

describe("AuthService", () => {
	describe("registerUser", () => {
		it("registers a new user with valid input", async () => {
			const result = await registerUser({
				email: "new@example.com",
				username: "newuser",
				displayName: "New User",
				password: "password123",
			});

			expect(result.userId).toBeDefined();
			expect(result.sessionToken).toBeDefined();

			// Verify user was created in database
			const user = await db.select().from(users).where(eq(users.id, result.userId)).get();

			expect(user).toBeDefined();
			expect(user?.email).toBe("new@example.com");
			expect(user?.username).toBe("newuser");
			expect(user?.role).toBe("user");
		});

		it("rejects duplicate email", async () => {
			await createTestUser({ email: "taken@example.com" });

			await expect(
				registerUser({
					email: "taken@example.com",
					username: "newuser",
					displayName: "New User",
					password: "password123",
				}),
			).rejects.toThrow("User with this email already exists");
		});

		it("rejects duplicate username", async () => {
			await createTestUser({
				email: "taken-username@example.com",
				username: "takenname",
			});

			await expect(
				registerUser({
					email: "new@example.com",
					username: "takenname",
					displayName: "New User",
					password: "password123",
				}),
			).rejects.toThrow("Username already taken");
		});
	});

	it("migrates legacy SHA-256 password to bcrypt on login", async () => {
		// Create a user with legacy SHA-256 hash (matches previous implementation)
		const id = `legacy-${Date.now()}`;
		const email = `legacy-${Date.now()}@example.com`;
		const username = `legacyuser-${Date.now()}`;
		const password = "legacy-pass-123";

		const legacyHash = createHash("sha256").update(`${password}salt`).digest("hex");

		await db.insert(users).values({
			id,
			email,
			username,
			displayName: "Legacy User",
			passwordHash: legacyHash,
			role: "user",
		});

		const result = await loginUser({ email, password });

		expect(result.userId).toBeDefined();
		expect(result.sessionToken).toBeDefined();

		// Verify password hash was upgraded to bcrypt prefix
		const updated = await db.select().from(users).where(eq(users.id, result.userId)).get();
		expect(updated).toBeDefined();
		expect(updated?.passwordHash.startsWith("bcrypt$")).toBe(true);
	});

	describe("loginUser", () => {
		it("logs in with valid credentials", async () => {
			await createTestUser({
				email: "login@example.com",
				password: "correctpassword",
			});

			const result = await loginUser({
				email: "login@example.com",
				password: "correctpassword",
			});

			expect(result.userId).toBeDefined();
			expect(result.sessionToken).toBeDefined();
		});

		it("rejects invalid email", async () => {
			await expect(
				loginUser({
					email: "nonexistent@example.com",
					password: "password123",
				}),
			).rejects.toThrow("Invalid email or password");
		});

		it("rejects invalid password", async () => {
			await createTestUser({
				email: "user@example.com",
				password: "correctpassword",
			});

			await expect(
				loginUser({
					email: "user@example.com",
					password: "wrongpassword",
				}),
			).rejects.toThrow("Invalid email or password");
		});

		it("rejects banned user", async () => {
			const user = await createTestUser({
				email: "banned@example.com",
				password: "password123",
			});

			// Ban the user
			await db
				.update(users)
				.set({
					bannedAt: new Date(),
					bannedReason: "Violated ToS",
				})
				.where(eq(users.id, user.id));

			await expect(
				loginUser({
					email: "banned@example.com",
					password: "password123",
				}),
			).rejects.toThrow("Account banned: Violated ToS");
		});
	});

	describe("getCurrentUser", () => {
		it("returns user data for valid userId", async () => {
			const testUser = await createTestUser({
				email: "current@example.com",
				username: "currentuser",
				displayName: "Current User",
			});

			const user = await getCurrentUser(testUser.id);

			expect(user.id).toBe(testUser.id);
			expect(user.email).toBe("current@example.com");
			expect(user.username).toBe("currentuser");
			expect(user.displayName).toBe("Current User");
			expect(user.role).toBe("user");
		});

		it("throws for non-existent user", async () => {
			await expect(getCurrentUser("nonexistent-id")).rejects.toThrow("User not found");
		});
	});
});
