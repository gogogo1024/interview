import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingSpinner } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
	it("renders a div element", () => {
		const { container } = render(<LoadingSpinner />);
		expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
	});

	it("renders with default medium size", () => {
		const { container } = render(<LoadingSpinner />);
		const spinner = container.firstChild;
		expect(spinner).toBeInTheDocument();
	});

	it("renders with small size", () => {
		const { container } = render(<LoadingSpinner size="sm" />);
		const spinner = container.firstChild;
		expect(spinner).toBeInTheDocument();
	});

	it("renders with medium size", () => {
		const { container } = render(<LoadingSpinner size="md" />);
		const spinner = container.firstChild;
		expect(spinner).toBeInTheDocument();
	});

	it("renders with large size", () => {
		const { container } = render(<LoadingSpinner size="lg" />);
		const spinner = container.firstChild;
		expect(spinner).toBeInTheDocument();
	});

	it("applies animation styles", () => {
		const { container } = render(<LoadingSpinner />);
		const spinner = container.firstChild as HTMLElement;
		// The spinner should have stylex-generated class names
		expect(spinner.className).toBeTruthy();
	});

	it("can be rendered multiple times independently", () => {
		const { container } = render(
			<>
				<LoadingSpinner size="sm" />
				<LoadingSpinner size="md" />
				<LoadingSpinner size="lg" />
			</>,
		);

		// container.firstChild is the React root div, its children are the spinners
		const spinners = container.querySelectorAll(":scope > div");
		expect(spinners).toHaveLength(3);
	});

	it("maintains consistent structure across rerenders", () => {
		const { container, rerender } = render(<LoadingSpinner size="sm" />);
		const initialClassName = (container.firstChild as HTMLElement).className;

		rerender(<LoadingSpinner size="sm" />);
		const rerenderedClassName = (container.firstChild as HTMLElement).className;

		expect(initialClassName).toBe(rerenderedClassName);
	});
});
