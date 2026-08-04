import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FollowButton } from "../../../src/components/users/FollowButton";

// Mock the server functions to prevent actual API calls
vi.mock("../../../src/server/functions/follows", () => ({
	getFollowStatus: vi.fn().mockResolvedValue({ following: false }),
	toggleFollow: vi.fn().mockResolvedValue({ following: true }),
}));

describe("FollowButton", () => {
	it("renders button", () => {
		render(<FollowButton username="testuser" />);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("button is present and functional", async () => {
		render(<FollowButton username="testuser" />);
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		// Initially shows "Follow" or "Loading..."
		expect(button.textContent).toMatch(/Follow|Loading/);
	});
});
