import { useSession } from "@tanstack/react-start/server";

export interface SessionData {
	userId: string;
	username: string;
}

// Session secret - in production, use environment variable
const SESSION_SECRET = process.env.SESSION_SECRET || "chirp-session-secret-key-at-least-32-chars";

export function useAppSession() {
	return useSession<SessionData>({
		password: SESSION_SECRET,
		name: "chirp-session",
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7, // 7 days
		},
	});
}

export async function getSessionData(): Promise<SessionData | null> {
	const session = await useAppSession();
	if (!session.data.userId) {
		return null;
	}
	return session.data as SessionData;
}

export async function setSessionData(data: SessionData): Promise<void> {
	const session = await useAppSession();
	await session.update(data);
}

export async function clearSessionData(): Promise<void> {
	const session = await useAppSession();
	await session.clear();
}

export async function requireAuth(): Promise<SessionData> {
	const session = await getSessionData();
	if (!session) {
		throw new Error("Unauthorized");
	}
	return session;
}
