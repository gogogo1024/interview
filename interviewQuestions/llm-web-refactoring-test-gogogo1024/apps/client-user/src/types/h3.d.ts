declare module "h3" {
	export type H3Request = {
		method?: string;
		url?: string;
		headers?: Record<string, string | string[]>;
	};

	export type H3Response = {
		statusCode?: number;
		setHeader?: (name: string, value: string) => void;
		[key: string]: unknown;
	};

	export type H3Event = {
		req: H3Request;
		res: H3Response;
	};

	export function defineEventHandler<T = unknown>(
		handler: (event: H3Event) => T | Promise<T>,
	): (event?: H3Event) => Promise<T>;

	export function readBody<T = unknown>(event?: H3Event): Promise<T>;
}
