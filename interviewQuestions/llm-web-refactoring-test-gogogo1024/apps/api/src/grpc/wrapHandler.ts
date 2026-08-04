import * as grpc from "@grpc/grpc-js";
import { getTraceId, runWithNewTrace } from "../observability/context";
import { logger } from "../observability/logger";
import { generateId } from "../services/utils";

type HandlerFn = (...args: any[]) => Promise<any>;

interface MetadataSink {
	sendMetadata(metadata: grpc.Metadata): void;
}

interface WrappedCallLike {
	call?: MetadataSink;
}

function isMetadataSink(value: unknown): value is MetadataSink {
	return (
		typeof value === "object" &&
		value !== null &&
		"sendMetadata" in value &&
		typeof (value as MetadataSink).sendMetadata === "function"
	);
}

function sendTraceMetadata(args: unknown[], traceId: string) {
	const md = new grpc.Metadata();
	md.set("x-trace-id", traceId);

	for (const arg of args) {
		if (!arg) continue;
		if (isMetadataSink(arg)) {
			arg.sendMetadata(md);
			return;
		}

		if (typeof arg === "object" && arg !== null && "call" in (arg as WrappedCallLike)) {
			const call = (arg as WrappedCallLike).call;
			if (call && isMetadataSink(call)) {
				call.sendMetadata(md);
				return;
			}
		}
	}
}

export function wrapGrpcHandler<T extends object>(handler: T, serviceName: string): T {
	const wrapped: Partial<Record<string, HandlerFn>> = {};

	for (const key of Object.keys(handler as Record<string, unknown>)) {
		const orig = (handler as Record<string, unknown>)[key];
		if (typeof orig !== "function") continue;

		wrapped[key] = (async (...args: any[]) => {
			const traceId = generateId();
			return runWithNewTrace(async () => {
				const method = `${serviceName}.${key}`;
				logger.info("grpc.request.start", { method });
				try {
					// Forward all args to original handler to preserve any optional context param
					const res = await orig.apply(handler, args);

					// Try to send traceId via gRPC metadata if possible
					try {
						sendTraceMetadata(args, traceId);
					} catch (_) {
						// ignore metadata errors
					}

					// If response contains an `error` field, append trace id so clients can report it
					if (res && typeof res === "object" && "error" in res && res.error) {
						try {
							res.error = `${res.error} (trace=${getTraceId()})`;
						} catch (_) {
							// swallow
						}
					}

					logger.info("grpc.request.end", { method });
					return res;
				} catch (err: any) {
					logger.error("grpc.request.error", {
						method,
						error: err && err.stack ? err.stack : String(err),
					});

					// Normalize errors: if it has a numeric `code`, rethrow with that code; else map to INTERNAL
					const message =
						err instanceof Error
							? `${err.message} (trace=${getTraceId()})`
							: `Internal error (trace=${getTraceId()})`;
					const e: any = new Error(message);
					if (err && typeof err.code === "number") {
						e.code = err.code;
					} else {
						e.code = grpc.status.INTERNAL;
					}
					throw e;
				}
			}, traceId);
		}) as any;
	}

	return wrapped as T;
}
