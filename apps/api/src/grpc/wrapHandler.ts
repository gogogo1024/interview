import * as grpc from "@grpc/grpc-js";
import { runWithNewTrace, getTraceId } from "../observability/context";
import { logger } from "../observability/logger";
import { generateId } from "../services/utils";

type AnyHandler = Record<string, (...args: any[]) => Promise<any>>;

export function wrapGrpcHandler<T extends AnyHandler>(handler: T, serviceName: string): T {
    const wrapped: Partial<T> = {};

    for (const key of Object.keys(handler)) {
        const orig = (handler as AnyHandler)[key];
        if (typeof orig !== "function") continue;

        wrapped[key as keyof T] = (async (...args: any[]) => {
            const traceId = generateId();
            return runWithNewTrace(async () => {
                const method = `${serviceName}.${key}`;
                logger.info("grpc.request.start", { method });
                try {
                    // Forward all args to original handler to preserve any optional context param
                    const res = await orig.apply(handler, args);

                    // Try to send traceId via gRPC metadata if possible
                    try {
                        const md = new grpc.Metadata();
                        md.set("x-trace-id", traceId);

                        // Common places where a metadata sink may exist on server-side adapters
                        for (const a of args) {
                            if (!a) continue;
                            // If adaptor exposes sendMetadata
                            if (typeof a.sendMetadata === "function") {
                                try {
                                    a.sendMetadata(md);
                                    break;
                                } catch (_) {
                                    // ignore
                                }
                            }

                            // grpc-js ServerUnaryCall has `call.sendMetadata` in some adapters
                            if (a.call && typeof a.call.sendMetadata === "function") {
                                try {
                                    a.call.sendMetadata(md);
                                    break;
                                } catch (_) {}
                            }

                            // Some adaptors pass (call, callback) directly; call may be args[0]
                            if (typeof a === "object" && typeof (a as any).metadata === "object" && typeof (a as any).sendMetadata === "function") {
                                try {
                                    (a as any).sendMetadata(md);
                                    break;
                                } catch (_) {}
                            }
                        }
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
                    logger.error("grpc.request.error", { method, error: err && err.stack ? err.stack : String(err) });

                    // Normalize errors: if it has a numeric `code`, rethrow with that code; else map to INTERNAL
                    const message = err instanceof Error ? `${err.message} (trace=${getTraceId()})` : `Internal error (trace=${getTraceId()})`;
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
