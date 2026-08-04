import { getTraceId } from "./context";

function formatLog(level: string, event: string, meta: Record<string, any> = {}) {
	const payload = {
		timestamp: new Date().toISOString(),
		level,
		event,
		traceId: getTraceId() || null,
		...meta,
	};
	// Structured JSON logs to stdout/stderr
	if (level === "error") {
		console.error(JSON.stringify(payload));
	} else {
		console.log(JSON.stringify(payload));
	}
}

export const logger = {
	info: (event: string, meta?: Record<string, any>) => formatLog("info", event, meta),
	warn: (event: string, meta?: Record<string, any>) => formatLog("warn", event, meta),
	error: (event: string, meta?: Record<string, any>) => formatLog("error", event, meta),
};
