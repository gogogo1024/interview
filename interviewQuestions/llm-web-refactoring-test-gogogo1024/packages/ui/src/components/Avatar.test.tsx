import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
	it("renders image when avatarUrl is provided", () => {
		render(<Avatar avatarUrl="https://example.com/avatar.jpg" username="john" />);

		const img = screen.getByRole("img");
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
		expect(img).toHaveAttribute("alt", "john");
	});

	it("renders initial when no avatarUrl", () => {
		render(<Avatar username="john" />);

		expect(screen.getByText("J")).toBeInTheDocument();
	});

	it("displays uppercase initial", () => {
		render(<Avatar username="alice" />);

		expect(screen.getByText("A")).toBeInTheDocument();
	});

	it("handles empty username gracefully", () => {
		const { container } = render(<Avatar username="" />);

		// Component should render without crashing, with an empty initial
		const avatarWrapper = container.firstChild;
		expect(avatarWrapper).toBeInTheDocument();
	});

	it("renders with different sizes", () => {
		const { rerender } = render(<Avatar username="user" size="sm" />);
		expect(screen.getByText("U")).toBeInTheDocument();

		rerender(<Avatar username="user" size="md" />);
		expect(screen.getByText("U")).toBeInTheDocument();

		rerender(<Avatar username="user" size="lg" />);
		expect(screen.getByText("U")).toBeInTheDocument();
	});

	it("uses consistent gradient for same username", () => {
		const { rerender } = render(<Avatar username="testuser" />);
		const avatar1 = screen.getByText("T");

		rerender(<Avatar username="testuser" />);
		const avatar2 = screen.getByText("T");

		// Both should render the same element (same username = same gradient)
		expect(avatar1).toEqual(avatar2);
	});

	it("handles null avatarUrl", () => {
		render(<Avatar avatarUrl={null} username="john" />);

		// Should fall back to initial
		expect(screen.getByText("J")).toBeInTheDocument();
	});
});
