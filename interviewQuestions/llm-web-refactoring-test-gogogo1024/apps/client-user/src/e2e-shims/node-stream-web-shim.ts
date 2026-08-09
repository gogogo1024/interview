// Minimal shim for `node:stream/web` to satisfy bundler analysis.
// Uses the browser's ReadableStream when available; otherwise
// provide a tiny placeholder that throws if constructed.
export const ReadableStream =
	globalThis.ReadableStream ||
	class ReadableStream {
		constructor() {
			throw new Error("ReadableStream is not available in this environment");
		}
	};

export default ReadableStream;
