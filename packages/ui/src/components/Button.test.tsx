import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
	it("renders children correctly", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
	});

	it("handles click events", () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click me</Button>);

		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("can be disabled", () => {
		const handleClick = vi.fn();
		render(
			<Button disabled onClick={handleClick}>
				Click me
			</Button>,
		);

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();

		fireEvent.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("renders with different variants", () => {
		const { rerender } = render(<Button variant="primary">Primary</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();

		rerender(<Button variant="secondary">Secondary</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();

		rerender(<Button variant="ghost">Ghost</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();

		rerender(<Button variant="danger">Danger</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("renders with different sizes", () => {
		const { rerender } = render(<Button size="sm">Small</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();

		rerender(<Button size="md">Medium</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();

		rerender(<Button size="lg">Large</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("supports fullWidth prop", () => {
		render(<Button fullWidth>Full Width</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("passes through additional props", () => {
		render(
			<Button type="submit" data-testid="submit-btn">
				Submit
			</Button>,
		);

		const button = screen.getByTestId("submit-btn");
		expect(button).toHaveAttribute("type", "submit");
	});
});
