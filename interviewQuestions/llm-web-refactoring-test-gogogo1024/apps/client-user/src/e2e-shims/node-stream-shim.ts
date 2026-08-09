// Minimal ESM shim for `node:stream` used only to satisfy bundler
// when server-only SSR helpers are present in dependencies.
// These implementations intentionally throw at runtime in the
// browser — their real implementations are server-only and not
// needed on the client. The shim prevents Rollup/Vite from failing
// when it statically analyzes imports.
export class Readable {
	constructor() {
		throw new Error("Readable is not available in the browser build");
	}
	static fromWeb() {
		throw new Error("Readable.fromWeb is not available in the browser build");
	}
	static toWeb() {
		throw new Error("Readable.toWeb is not available in the browser build");
	}
}

export class Writable {
	constructor() {
		throw new Error("Writable is not available in the browser build");
	}
}

export class Duplex extends Readable {
	constructor() {
		super();
		throw new Error("Duplex is not available in the browser build");
	}
}

export class PassThrough extends Duplex {
	constructor() {
		super();
		throw new Error("PassThrough is not available in the browser build");
	}
}

export class Transform extends Duplex {}

export default Readable;
