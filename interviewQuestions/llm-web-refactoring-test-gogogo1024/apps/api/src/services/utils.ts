import bcrypt from "bcryptjs";
import { createHash } from "crypto";

/**
 * Generate a simple ID
 */
export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

const BCRYPT_PREFIX = "bcrypt$";
const BCRYPT_ROUNDS = 10;
const LEGACY_SALT = "salt";

/**
 * Hash password using bcrypt and prefix to indicate algorithm
 */
export async function hashPassword(password: string): Promise<string> {
	const bcryptHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
	return `${BCRYPT_PREFIX}${bcryptHash}`;
}

/**
 * Verify password against hash. Supports legacy SHA-256 hashes for migration.
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	if (hashedPassword.startsWith(BCRYPT_PREFIX)) {
		const bcryptHash = hashedPassword.slice(BCRYPT_PREFIX.length);
		return bcrypt.compare(password, bcryptHash);
	}

	// Legacy SHA-256 verification
	const hash = createHash("sha256");
	hash.update(password + LEGACY_SALT);
	const computed = hash.digest("hex");
	return computed === hashedPassword;
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
