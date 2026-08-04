import { describe, expect, it } from "vitest";
import { cn, formatRelativeTime } from "../../../src/lib/utils";

describe("Utils", () => {
	describe("cn", () => {
		it("merges class names correctly", () => {
			expect(cn("foo", "bar")).toBe("foo bar");
		});

		it("handles conditional classes", () => {
			expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
		});

		it("handles undefined and null", () => {
			expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
		});
	});

	describe("formatRelativeTime", () => {
		it('returns "just now" for very recent times', () => {
			const now = new Date();
			expect(formatRelativeTime(now)).toBe("just now");
		});

		it("returns minutes ago for times less than an hour", () => {
			const minutesAgo = new Date(Date.now() - 30 * 60 * 1000);
			expect(formatRelativeTime(minutesAgo)).toBe("30m ago");
		});

		it("returns hours ago for times less than a day", () => {
			const hoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
			expect(formatRelativeTime(hoursAgo)).toBe("5h ago");
		});

		it("returns days ago for times less than a week", () => {
			const daysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
			expect(formatRelativeTime(daysAgo)).toBe("3d ago");
		});

		it("returns formatted date for times older than a week", () => {
			const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
			const result = formatRelativeTime(oldDate);
			// Just verify it returns a date string
			expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
		});
	});
});
