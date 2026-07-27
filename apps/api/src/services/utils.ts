import { createHash } from "crypto";

/**
 * Generate a simple ID
 */
export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Hash password using SHA-256 (in production, use bcrypt)
 */
export async function hashPassword(password: string): Promise<string> {
	const hash = createHash("sha256");
	hash.update(password + "salt");
	return hash.digest("hex");
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	const hash = await hashPassword(password);
	return hash === hashedPassword;
}

/**
 * Convert Date to protobuf Timestamp
 */
export function toProtoTimestamp(date: Date): { seconds: bigint; nanos: number } {
	const ms = date.getTime();
	return {
		seconds: BigInt(Math.floor(ms / 1000)),
		nanos: (ms % 1000) * 1000000,
	};
}

/**
 * Convert protobuf Timestamp to Date
 */
export function fromProtoTimestamp(timestamp: { seconds: bigint; nanos: number }): Date {
	return new Date(Number(timestamp.seconds) * 1000 + timestamp.nanos / 1000000);
}
