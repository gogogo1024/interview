import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CharacterCount } from "../../../src/components/shared/CharacterCount";

describe("CharacterCount", () => {
	it("displays current and max count", () => {
		render(<CharacterCount count={50} max={280} />);
		expect(screen.getByText("50/280")).toBeInTheDocument();
	});

	it("renders with count below limit", () => {
		const { container } = render(<CharacterCount count={100} max={280} />);
		const span = container.querySelector("span");
		expect(span).toBeInTheDocument();
		expect(span).toHaveTextContent("100/280");
	});

	it("renders with count near limit (90-100%)", () => {
		const { container } = render(<CharacterCount count={260} max={280} />);
		const span = container.querySelector("span");
		expect(span).toBeInTheDocument();
		expect(span).toHaveTextContent("260/280");
	});

	it("renders with count exceeding limit", () => {
		const { container } = render(<CharacterCount count={300} max={280} />);
		const span = container.querySelector("span");
		expect(span).toBeInTheDocument();
		expect(span).toHaveTextContent("300/280");
	});
});
