import { AsyncLocalStorage } from "async_hooks";
import { generateId } from "../services/utils";

type TraceContext = { traceId: string };

const als = new AsyncLocalStorage<TraceContext>();

export function runWithNewTrace<T>(fn: () => Promise<T>, traceId?: string): Promise<T> {
	const id = traceId || generateId();
	// AsyncLocalStorage.run accepts a synchronous callback, but returning a Promise
	// from the callback preserves the async context for downstream awaits.
	return als.run({ traceId: id }, fn) as Promise<T>;
}

export function getTraceId(): string | undefined {
	return als.getStore()?.traceId;
}
