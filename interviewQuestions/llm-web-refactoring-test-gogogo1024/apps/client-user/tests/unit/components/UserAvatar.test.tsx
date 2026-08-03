import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserAvatar } from "../../../src/components/users/UserAvatar";

describe("UserAvatar", () => {
	it("renders image when avatarUrl is provided", () => {
		render(<UserAvatar avatarUrl="https://example.com/avatar.jpg" username="testuser" />);
		const img = screen.getByRole("img");
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
		expect(img).toHaveAttribute("alt", "testuser");
	});

	it("renders initial when no avatarUrl is provided", () => {
		render(<UserAvatar avatarUrl={null} username="testuser" />);
		expect(screen.getByText("T")).toBeInTheDocument();
	});

	it("renders avatar for sm variant", () => {
		const { container } = render(<UserAvatar avatarUrl={null} username="test" size="sm" />);
		expect(container.firstChild).toBeInTheDocument();
		expect(screen.getByText("T")).toBeInTheDocument();
	});

	it("renders avatar for md variant", () => {
		const { container } = render(<UserAvatar avatarUrl={null} username="test" size="md" />);
		expect(container.firstChild).toBeInTheDocument();
		expect(screen.getByText("T")).toBeInTheDocument();
	});

	it("renders avatar for lg variant", () => {
		const { container } = render(<UserAvatar avatarUrl={null} username="test" size="lg" />);
		expect(container.firstChild).toBeInTheDocument();
		expect(screen.getByText("T")).toBeInTheDocument();
	});
});
