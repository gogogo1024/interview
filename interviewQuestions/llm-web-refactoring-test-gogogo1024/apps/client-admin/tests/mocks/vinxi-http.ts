// Mock @tanstack/react-start/server for tests

export function useSession<T>(_config: Record<string, unknown>) {
	return Promise.resolve({
		id: undefined,
		data: {} as T,
		update: async (_data: Partial<T>) => {},
		clear: async () => {},
	});
}
