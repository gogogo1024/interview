/**
 * Session data stored in cookies
 */
export interface SessionData {
	userId: string;
	username: string;
	role: "user" | "admin" | "moderator";
}

/**
 * JWT payload for gRPC authentication
 */
export interface GrpcSessionPayload {
	userId: string;
	username: string;
	role: "user" | "admin" | "moderator";
	iat: number;
	exp: number;
}
