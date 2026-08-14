import { type ChirpClient, createChirpClient } from "@chirp/grpc-client";
import { getAdminSessionData } from "./session.server";

// gRPC API host
const GRPC_HOST = process.env.GRPC_API_HOST || "localhost:50051";

// Singleton gRPC client
let grpcClient: ChirpClient | null = null;

function readEnv(): NodeJS.ProcessEnv | undefined {
	try {
		// Avoid bundler inlining by using bracket access to process.env.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const p: any = typeof process !== "undefined" ? process : undefined;
		return p && p["env"] ? p["env"] : undefined;
	} catch {
		return undefined;
	}
}

function isGrpcSecureAtRuntime(): boolean {
	const env = readEnv();
	if (env && env["GRPC_API_SECURE"] !== undefined) {
		return env["GRPC_API_SECURE"] === "true";
	}
	if (env && env["NODE_ENV"]) {
		return env["NODE_ENV"] === "production";
	}
	return false;
}

/**
 * Get or create the gRPC client singleton
 */
export function getGrpcClient(): ChirpClient {
	if (!grpcClient) {
		const runtimeSecure = isGrpcSecureAtRuntime();
		grpcClient = createChirpClient({
			host: GRPC_HOST,
			secure: runtimeSecure,
		});
	}
	return grpcClient;
}

/**
 * Creates a JWT session token from cookie session data for gRPC calls
 * Token includes admin/moderator role for authorization
 * Token expires in 5 minutes (short-lived for security)
 */
/**
 * Gets the current admin session token for gRPC calls
 * Returns undefined if user is not authenticated as admin/moderator
 * Prefer the server-issued token stored in the admin session
 */
export async function getAdminGrpcSessionToken(): Promise<string | undefined> {
	const session = await getAdminSessionData();
	if (!session) return undefined;
	return session.sessionToken;
}

/**
 * Gets a required admin session token, throws if not authenticated
 */
export async function requireAdminGrpcSessionToken(): Promise<string> {
	const token = await getAdminGrpcSessionToken();
	if (!token) {
		throw new Error("Admin authentication required");
	}
	return token;
}

/**
 * Helper to convert proto Timestamp to Date
 */
export function fromProtoTimestamp(
	timestamp: { seconds: bigint; nanos: number } | undefined,
): Date {
	if (!timestamp) {
		return new Date();
	}
	return new Date(Number(timestamp.seconds) * 1000 + Math.floor(timestamp.nanos / 1000000));
}
