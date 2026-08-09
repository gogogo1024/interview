// Minimal shim for `node:async_hooks` AsyncLocalStorage used in
// some server-side utilities. This is a no-op placeholder for
// browser/dev environments so bundlers can resolve the import.
export class AsyncLocalStorage<T = unknown> {
	run(_store: T, callback: (...args: unknown[]) => unknown, ...args: unknown[]): unknown {
		// Call the callback with the provided args; runtime behavior is intentionally
		// minimal for the shim environment.
		return callback(...(args as unknown[]));
	}

	getStore(): T | undefined {
		return undefined;
	}

	enterWith(_store: T): void {
		// no-op
	}
}

export default AsyncLocalStorage;
