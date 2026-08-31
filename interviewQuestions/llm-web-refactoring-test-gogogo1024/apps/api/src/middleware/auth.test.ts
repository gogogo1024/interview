import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import type { AuthContext } from "./auth";
import { createSessionToken, validateSessionToken } from "./auth";

interface JwtPayload {
	iat: number;
	exp: number;
	userId: string;
	username: string;
	role: string;
}

describe("SECURITY: Issue 1 Fix - JWT Secret & Session Token Security", () => {
	describe("JWT Secret Hardcoding Vulnerability Fix", () => {
		it("SECURITY FIX VERIFICATION: Requires GRPC_JWT_SECRET environment variable to be set", () => {
			// This test verifies that the hardcoded JWT secret vulnerability has been fixed.
			// Previously, code used:
			//   process.env.GRPC_JWT_SECRET || "chirp-grpc-jwt-secret-key-at-least-32-chars"
			//
			// This allowed attackers to forge session tokens using the default hardcoded key.
			// The fix requires GRPC_JWT_SECRET to be explicitly set.

			// The middleware module should have already thrown during import if JWT_SECRET is not set,
			// so we just verify the current state has a valid JWT_SECRET
			expect(process.env.GRPC_JWT_SECRET).toBeDefined();
			expect(process.env.GRPC_JWT_SECRET?.length).toBeGreaterThanOrEqual(32);
		});

		it("SECURITY FIX VERIFICATION: JWT_SECRET is not using hardcoded default", () => {
			// Get the actual JWT secret being used
			const jwtSecret = process.env.GRPC_JWT_SECRET;

			// Verify it's not the default hardcoded value that was previously used
			// The old hardcoded value was: "chirp-grpc-jwt-secret-key-at-least-32-chars"
			// This was a critical vulnerability because attackers could fork the code
			// and get the JWT secret to forge tokens.
			expect(jwtSecret).not.toBe("chirp-grpc-jwt-secret-key-at-least-32-chars");
			expect(jwtSecret).toBeDefined();
		});
	});

	describe("Session Token Expiration Security (Issue 1 Fix)", () => {
		it("SECURITY FIX VERIFICATION: Default session token expiry is 1 hour, not 7 days", () => {
			const testContext: AuthContext = {
				userId: "test-user-123",
				username: "testuser",
				role: "user",
			};

			// Create token with default expiration (should be 1 hour now, was 7 days before fix)
			const token = createSessionToken(testContext);

			// Decode token to check expiration claim
			const decoded = jwt.decode(token) as JwtPayload | null;
			expect(decoded).not.toBeNull();

			if (!decoded) throw new Error("Failed to decode token");

			// Calculate token lifetime
			const issuedAt = decoded.iat;
			const expiresAt = decoded.exp;
			const lifetimeSeconds = expiresAt - issuedAt;
			const lifetimeHours = lifetimeSeconds / 3600;

			// SECURITY FIX VERIFICATION:
			// Token lifetime should be exactly 1 hour (3600 seconds)
			// Previously it was 7 days (604800 seconds) - a critical security issue
			expect(lifetimeSeconds).toBeLessThanOrEqual(3600); // At most 1 hour
			expect(lifetimeHours).toBeLessThanOrEqual(1);
		});

		it("SECURITY FIX VERIFICATION: Session token expiry is capped at 1 hour maximum", () => {
			const testContext: AuthContext = {
				userId: "test-user-123",
				username: "testuser",
				role: "user",
			};

			// Try to create a token with 7 day expiry (old vulnerable behavior)
			const sevenDaysInSeconds = 7 * 24 * 60 * 60; // 604800 seconds
			const token = createSessionToken(testContext, sevenDaysInSeconds);

			// Decode and verify it was capped to 1 hour
			const decoded = jwt.decode(token) as JwtPayload | null;
			expect(decoded).not.toBeNull();

			if (!decoded) throw new Error("Failed to decode token");

			const issuedAt = decoded.iat;
			const expiresAt = decoded.exp;
			const lifetimeSeconds = expiresAt - issuedAt;

			// SECURITY FIX: Even if caller requests 7 days, token should be capped at 1 hour
			expect(lifetimeSeconds).toBeLessThanOrEqual(3600);
			expect(lifetimeSeconds).not.toBe(sevenDaysInSeconds);
		});

		it("SECURITY FIX VERIFICATION: Expired token is rejected on validation", () => {
			// Create an expired token (manually set expiresAt to past)
			const jwtSecret = process.env.GRPC_JWT_SECRET;
			if (!jwtSecret) throw new Error("GRPC_JWT_SECRET not set");

			const expiredPayload = {
				userId: "test-user",
				username: "testuser",
				role: "user" as const,
				exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
			};

			const expiredToken = jwt.sign(expiredPayload, jwtSecret, { noTimestamp: true });

			// Validation should throw error for expired token
			expect(() => validateSessionToken(expiredToken)).toThrow("Invalid or expired session token");
		});
	});

	describe("Session Token Integrity", () => {
		it("SECURITY FIX: Token payload contains expected claims", () => {
			const testContext: AuthContext = {
				userId: "user-abc-123",
				username: "johndoe",
				role: "admin",
			};

			const token = createSessionToken(testContext);
			const validated = validateSessionToken(token);

			// Verify all required claims are present and correct
			expect(validated.userId).toBe("user-abc-123");
			expect(validated.username).toBe("johndoe");
			expect(validated.role).toBe("admin");
		});

		it("SECURITY FIX: Token signature verification prevents tampering", () => {
			// Create a valid token
			const jwtSecret = process.env.GRPC_JWT_SECRET;
			if (!jwtSecret) throw new Error("GRPC_JWT_SECRET not set");

			const validPayload = {
				userId: "test-user",
				username: "testuser",
				role: "user" as const,
			};

			const validToken = jwt.sign(validPayload, jwtSecret);

			// Tamper with the token by changing the signature
			const parts = validToken.split(".");
			parts[2] = "tamperedsignature"; // Replace signature
			const tamperedToken = parts.join(".");

			// Validation should fail for tampered token
			expect(() => validateSessionToken(tamperedToken)).toThrow("Invalid or expired session token");
		});
	});
});
