import { type ChirpClient, createChirpClient } from "@chirp/grpc-client";
import { getSessionData } from "./session.server";

// gRPC API host
const GRPC_HOST = process.env.GRPC_API_HOST || "localhost:50051";

// Singleton gRPC client
let grpcClient: ChirpClient | null = null;

/**
 * Get or create the gRPC client singleton
 */
export function getGrpcClient(): ChirpClient {
	if (!grpcClient) {
		grpcClient = createChirpClient({
			host: GRPC_HOST,
			secure: process.env.NODE_ENV === "production",
		});
	}
	return grpcClient;
}

/**
 * Creates a JWT session token from cookie session data for gRPC calls
 * Token expires in 5 minutes (short-lived for security)
 */
/**
 * Gets the current session token for gRPC calls
 * Returns undefined if user is not authenticated
 * Prefer the server-issued token stored in the session (set at login/register)
 */
export async function getGrpcSessionToken(): Promise<string | undefined> {
	const session = await getSessionData();
	if (!session) return undefined;
	return session.sessionToken;
}

/**
 * Gets a required session token, throws if not authenticated
 */
export async function requireGrpcSessionToken(): Promise<string> {
	const token = await getGrpcSessionToken();
	if (!token) {
		throw new Error("Authentication required");
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
