// Mock @tanstack/react-start for tests

type AnyFunction = (...args: unknown[]) => unknown;

interface ServerFnBuilder {
	inputValidator: (validator: AnyFunction) => ServerFnBuilder;
	handler: (handler: (opts: { data: unknown }) => unknown) => ((
		data: unknown,
	) => Promise<unknown>) & {
		handler: (opts: { data: unknown }) => unknown;
	};
}

export function createServerFn(_options?: { method?: string }): ServerFnBuilder {
	let storedHandler: ((opts: { data: unknown }) => unknown) | undefined;
	let storedValidator: AnyFunction | undefined;

	const builder: ServerFnBuilder = {
		inputValidator(validator) {
			storedValidator = validator;
			return builder;
		},
		handler(handler) {
			storedHandler = handler;
			const currentHandler = storedHandler;
			// Return a callable that also exposes the handler for direct testing
			const fn = (async (data: unknown) => {
				const validatedData = storedValidator ? storedValidator(data) : data;
				return currentHandler ? currentHandler({ data: validatedData }) : undefined;
			}) as ((data: unknown) => Promise<unknown>) & {
				handler: (opts: { data: unknown }) => unknown;
			};
			fn.handler = currentHandler as (opts: { data: unknown }) => unknown;
			return fn;
		},
	};

	return builder;
}
