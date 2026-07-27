import { type ChirpClient, createChirpClient } from "@chirp/grpc-client";
import jwt from "jsonwebtoken";
import { getSessionData, type SessionData } from "./session.server";

// JWT secret must match the API server
const JWT_SECRET = process.env.GRPC_JWT_SECRET || "chirp-grpc-jwt-secret-key-at-least-32-chars";

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
export function createGrpcSessionToken(
	session: SessionData,
	role: "user" | "admin" | "moderator" = "user",
): string {
	return jwt.sign(
		{
			userId: session.userId,
			username: session.username,
			role,
		},
		JWT_SECRET,
		{ expiresIn: 300 }, // 5 minutes
	);
}

/**
 * Gets the current session token for gRPC calls
 * Returns undefined if user is not authenticated
 */
export async function getGrpcSessionToken(): Promise<string | undefined> {
	const session = await getSessionData();
	if (!session) {
		return undefined;
	}
	return createGrpcSessionToken(session);
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
