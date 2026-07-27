import { createServerFn } from "@tanstack/react-start";
import { fromProtoTimestamp, getGrpcClient, getGrpcSessionToken } from "../../lib/grpc.server";
import { clearSessionData, getSessionData, setSessionData } from "../../lib/session.server";

export const registerUser = createServerFn({ method: "POST" })
	.inputValidator(
		(d: { email: string; username: string; displayName: string; password: string }) => d,
	)
	.handler(async ({ data }) => {
		const client = getGrpcClient();

		const { response } = await client.auth.register({
			email: data.email,
			username: data.username,
			displayName: data.displayName,
			password: data.password,
		});

		if (!response.success) {
			throw new Error(response.error || "Registration failed");
		}

		// Store session in cookie
		await setSessionData({
			userId: response.userId,
			username: data.username,
		});

		return { success: true, userId: response.userId };
	});

export const loginUser = createServerFn({ method: "POST" })
	.inputValidator((d: { email: string; password: string }) => d)
	.handler(async ({ data }) => {
		const client = getGrpcClient();

		const { response } = await client.auth.login({
			email: data.email,
			password: data.password,
		});

		if (!response.success) {
			throw new Error(response.error || "Login failed");
		}

		// We need to get the username for the session - validate the returned token
		const { response: validateResponse } = await client.auth.validateSession({
			sessionToken: response.sessionToken,
		});

		if (!validateResponse.valid) {
			throw new Error("Failed to validate session");
		}

		// Store session in cookie
		await setSessionData({
			userId: response.userId,
			username: validateResponse.username,
		});

		return { success: true, userId: response.userId };
	});

export const logoutUser = createServerFn({ method: "POST" }).handler(async () => {
	const sessionToken = await getGrpcSessionToken();
	if (sessionToken) {
		const client = getGrpcClient();
		await client.auth.logout({ sessionToken });
	}
	await clearSessionData();
	return { success: true };
});

export const getCurrentUser = createServerFn().handler(async () => {
	const session = await getSessionData();
	if (!session) return null;

	const sessionToken = await getGrpcSessionToken();
	if (!sessionToken) {
		await clearSessionData();
		return null;
	}

	try {
		const client = getGrpcClient();
		const { response } = await client.auth.getCurrentUser({ sessionToken });

		return {
			id: response.id,
			email: response.email,
			username: response.username,
			displayName: response.displayName,
			avatarUrl: response.avatarUrl,
			bio: response.bio,
			role: response.role,
			createdAt: fromProtoTimestamp(response.createdAt),
		};
	} catch {
		await clearSessionData();
		return null;
	}
});
