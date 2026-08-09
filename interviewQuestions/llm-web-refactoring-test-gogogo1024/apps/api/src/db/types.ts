export type DbClient = {
	execute: (...args: unknown[]) => Promise<unknown>;
};
