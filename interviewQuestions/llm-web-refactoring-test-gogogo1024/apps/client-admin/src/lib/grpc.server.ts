import { type ChirpClient, createChirpClient } from "@chirp/grpc-client";
import { getAdminSessionData } from "./session.server";

// gRPC API host (read at runtime using bracket access to avoid bundler inlining)
const GRPC_HOST = (process as any)["env"]?.GRPC_API_HOST || "localhost:50051";

function readEnv(name: string): string | undefined {
	const env = (process as any)["env"];
	return env ? env[name] : undefined;
}

export function isGrpcSecureAtRuntime(): boolean {
	const v = readEnv("GRPC_API_SECURE");
	if (v !== undefined) {
		return ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
	}
	const nodeEnv = readEnv("NODE_ENV");
	return nodeEnv === "production";
}

// Singleton gRPC client
let grpcClient: ChirpClient | null = null;

/**
 * Get or create the gRPC client singleton
 */
export function getGrpcClient(): ChirpClient {
	if (!grpcClient) {
		grpcClient = createChirpClient({
			host: GRPC_HOST,
			secure: isGrpcSecureAtRuntime(),
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
