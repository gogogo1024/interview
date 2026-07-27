// Mock @tanstack/react-start for tests

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

interface ServerFnBuilder {
	inputValidator: (validator: AnyFunction) => ServerFnBuilder;
	handler: (handler: AnyFunction) => AnyFunction & { handler: AnyFunction };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createServerFn(_options?: { method?: string }): ServerFnBuilder {
	let storedHandler: AnyFunction | undefined;
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
			const fn = async (data: unknown) => {
				const validatedData = storedValidator ? storedValidator(data) : data;
				return currentHandler({ data: validatedData });
			};
			(fn as AnyFunction & { handler: AnyFunction }).handler = currentHandler;
			return fn as AnyFunction & { handler: AnyFunction };
		},
	};

	return builder;
}
