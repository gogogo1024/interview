import type { GrpcSessionPayload } from "@chirp/shared-types";
import jwt from "jsonwebtoken";
import { forbidden, unauthorized } from "../observability/errors";

// JWT_SECRET must be set in environment. Using a hardcoded default is a critical security vulnerability.
function getJwtSecret(): string {
	const secret = process.env.GRPC_JWT_SECRET;

	if (!secret) {
		throw new Error(
			"FATAL: GRPC_JWT_SECRET environment variable not set. " +
				"This is required for secure session token generation. " +
				"Set a random 32+ character string in your environment configuration.",
		);
	}

	if (secret.length < 32) {
		throw new Error(
			"FATAL: GRPC_JWT_SECRET must be at least 32 characters long. " +
				"Current length: " +
				secret.length,
		);
	}

	return secret;
}

const JWT_SECRET: string = getJwtSecret();

export interface AuthContext {
	userId: string;
	username: string;
	role: "user" | "admin" | "moderator";
}

/**
 * Validates a session token and returns the auth context
 */
export function validateSessionToken(token: string): AuthContext {
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as GrpcSessionPayload;
		return {
			userId: decoded.userId,
			username: decoded.username,
			role: decoded.role,
		};
	} catch (_error) {
		throw unauthorized("Invalid or expired session token");
	}
}

/**
 * Creates a session token from auth context
 * @param context - User authentication context
 * @param expiresInSeconds - Token expiry time. Capped at 1 hour for security best practices.
 *                          For longer-lived sessions, use refresh tokens instead.
 */
export function createSessionToken(
	context: AuthContext,
	expiresInSeconds: number = 3600, // 1 hour default (was 7 days - SECURITY ISSUE)
): string {
	// Cap token lifetime at 1 hour max for security.
	// Longer-lived sessions should use separate refresh tokens.
	const cappedExpiry = Math.min(expiresInSeconds, 3600);

	return jwt.sign(
		{
			userId: context.userId,
			username: context.username,
			role: context.role,
		},
		JWT_SECRET,
		{ expiresIn: cappedExpiry },
	);
}

/**
 * Requires authentication - throws if token is invalid
 */
export function requireAuth(token: string | undefined): AuthContext {
	if (!token) {
		throw unauthorized("Authentication required");
	}
	return validateSessionToken(token);
}

/**
 * Requires admin or moderator role
 */
export function requireAdmin(context: AuthContext): void {
	if (context.role !== "admin" && context.role !== "moderator") {
		throw forbidden("Admin access required");
	}
}

/**
 * Requires admin role specifically
 */
export function requireSuperAdmin(context: AuthContext): void {
	if (context.role !== "admin") {
		throw forbidden("Super admin access required");
	}
}

export { JWT_SECRET };
