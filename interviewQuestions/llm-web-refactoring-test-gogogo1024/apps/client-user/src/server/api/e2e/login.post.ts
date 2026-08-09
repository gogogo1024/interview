import { defineEventHandler, readBody } from "h3";
import { getGrpcClient } from "../../../lib/grpc.server";
import { setSessionData } from "../../../lib/session.server";

/**
 * E2E-only login endpoint.
 * POST /api/e2e/login
 * Body: { email, password }
 * On success: sets the same `chirp-session` cookie as normal login and returns { success, userId }
 * This endpoint is intended for test use only and should not be exposed in production.
 */
export default defineEventHandler(async (event) => {
	const body = (await readBody(event)) as any;
	const email = body?.email;
	const password = body?.password;

	if (!email || !password) {
		event.res.statusCode = 400;
		return { success: false, error: "missing_credentials" };
	}

	try {
		const client = getGrpcClient();
		const { response } = await client.auth.login({ email, password });

		if (!response.success) {
			event.res.statusCode = 401;
			return { success: false, error: response.error || "login_failed" };
		}

		const { response: validateResponse } = await client.auth.validateSession({
			sessionToken: response.sessionToken,
		});
		if (!validateResponse.valid) {
			event.res.statusCode = 500;
			return { success: false, error: "validate_failed" };
		}

		// Persist session via the same helper used elsewhere so cookie semantics match.
		await setSessionData({
			userId: response.userId,
			username: validateResponse.username,
			sessionToken: response.sessionToken,
		});

		return { success: true, userId: response.userId };
	} catch (err: any) {
		event.res.statusCode = 500;
		return { success: false, error: String(err?.message || err) };
	}
});
