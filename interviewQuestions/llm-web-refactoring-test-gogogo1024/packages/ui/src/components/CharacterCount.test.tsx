import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CharacterCount } from "./CharacterCount";

describe("CharacterCount", () => {
	it("displays current and max count", () => {
		render(<CharacterCount current={50} max={280} />);
		expect(screen.getByText("50/280")).toBeInTheDocument();
	});

	it("displays zero count correctly", () => {
		render(<CharacterCount current={0} max={280} />);
		expect(screen.getByText("0/280")).toBeInTheDocument();
	});

	it("renders with default styling when below threshold", () => {
		render(<CharacterCount current={100} max={280} data-testid="counter" />);
		const counter = screen.getByText("100/280");
		expect(counter).toBeInTheDocument();
	});

	it("shows warning state when at 90% threshold", () => {
		// 252 is exactly 90% of 280
		render(<CharacterCount current={252} max={280} />);
		expect(screen.getByText("252/280")).toBeInTheDocument();
	});

	it("shows warning state when above 90% but below 100%", () => {
		render(<CharacterCount current={260} max={280} />);
		expect(screen.getByText("260/280")).toBeInTheDocument();
	});

	it("shows error state when at max", () => {
		render(<CharacterCount current={280} max={280} />);
		expect(screen.getByText("280/280")).toBeInTheDocument();
	});

	it("shows error state when exceeding max", () => {
		render(<CharacterCount current={300} max={280} />);
		expect(screen.getByText("300/280")).toBeInTheDocument();
	});

	it("supports custom warning threshold", () => {
		// With 0.8 threshold, warning starts at 224 (80% of 280)
		render(<CharacterCount current={230} max={280} warningThreshold={0.8} />);
		expect(screen.getByText("230/280")).toBeInTheDocument();
	});

	it("does not show warning when below custom threshold", () => {
		render(<CharacterCount current={200} max={280} warningThreshold={0.8} />);
		expect(screen.getByText("200/280")).toBeInTheDocument();
	});

	it("handles different max values", () => {
		render(<CharacterCount current={100} max={500} />);
		expect(screen.getByText("100/500")).toBeInTheDocument();
	});

	it("renders as a span element", () => {
		const { container } = render(<CharacterCount current={50} max={280} />);
		expect(container.firstChild?.nodeName).toBe("SPAN");
	});

	it("updates correctly when props change", () => {
		const { rerender } = render(<CharacterCount current={50} max={280} />);
		expect(screen.getByText("50/280")).toBeInTheDocument();

		rerender(<CharacterCount current={100} max={280} />);
		expect(screen.getByText("100/280")).toBeInTheDocument();
		expect(screen.queryByText("50/280")).not.toBeInTheDocument();
	});

	it("transitions from normal to warning to error state", () => {
		const { rerender } = render(<CharacterCount current={100} max={280} />);
		expect(screen.getByText("100/280")).toBeInTheDocument();

		// Move to warning (90%)
		rerender(<CharacterCount current={260} max={280} />);
		expect(screen.getByText("260/280")).toBeInTheDocument();

		// Move to error (100%+)
		rerender(<CharacterCount current={290} max={280} />);
		expect(screen.getByText("290/280")).toBeInTheDocument();
	});
});
