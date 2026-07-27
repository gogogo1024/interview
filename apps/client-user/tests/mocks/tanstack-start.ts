// Mock @tanstack/react-start for tests
import { vi } from "vitest";

export function createServerFn(_method: string, _fn: any) {
	return vi.fn();
}
