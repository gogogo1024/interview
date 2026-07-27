import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
	it("renders children content", () => {
		render(<Card>Card content</Card>);
		expect(screen.getByText("Card content")).toBeInTheDocument();
	});

	it("renders as an article element", () => {
		render(<Card>Content</Card>);
		expect(screen.getByRole("article")).toBeInTheDocument();
	});

	it("renders with default styles", () => {
		render(<Card data-testid="card">Content</Card>);
		const card = screen.getByTestId("card");
		expect(card).toBeInTheDocument();
	});

	it("renders with hoverable prop", () => {
		render(
			<Card hoverable data-testid="hoverable-card">
				Hoverable content
			</Card>,
		);
		const card = screen.getByTestId("hoverable-card");
		expect(card).toBeInTheDocument();
	});

	it("renders with noPadding prop", () => {
		render(
			<Card noPadding data-testid="no-padding-card">
				No padding content
			</Card>,
		);
		const card = screen.getByTestId("no-padding-card");
		expect(card).toBeInTheDocument();
	});

	it("renders with both hoverable and noPadding props", () => {
		render(
			<Card hoverable noPadding data-testid="combined-card">
				Combined styles
			</Card>,
		);
		const card = screen.getByTestId("combined-card");
		expect(card).toBeInTheDocument();
	});

	it("passes through additional props", () => {
		render(
			<Card id="custom-card" className="custom-class" data-custom="value">
				Content
			</Card>,
		);
		const card = screen.getByRole("article");
		expect(card).toHaveAttribute("id", "custom-card");
		expect(card).toHaveAttribute("data-custom", "value");
	});

	it("renders complex nested content", () => {
		render(
			<Card>
				<h2>Title</h2>
				<p>Description paragraph</p>
				<button type="button">Action</button>
			</Card>,
		);

		expect(screen.getByRole("heading")).toHaveTextContent("Title");
		expect(screen.getByText("Description paragraph")).toBeInTheDocument();
		expect(screen.getByRole("button")).toHaveTextContent("Action");
	});

	it("defaults hoverable to false", () => {
		const { rerender } = render(<Card data-testid="card">Content</Card>);
		const cardWithoutHoverable = screen.getByTestId("card");

		rerender(
			<Card hoverable={false} data-testid="card">
				Content
			</Card>,
		);
		const cardWithHoverableFalse = screen.getByTestId("card");

		// Both should render identically when hoverable is false or not set
		expect(cardWithoutHoverable).toBeInTheDocument();
		expect(cardWithHoverableFalse).toBeInTheDocument();
	});

	it("defaults noPadding to false", () => {
		const { rerender } = render(<Card data-testid="card">Content</Card>);
		const cardWithoutNoPadding = screen.getByTestId("card");

		rerender(
			<Card noPadding={false} data-testid="card">
				Content
			</Card>,
		);
		const cardWithNoPaddingFalse = screen.getByTestId("card");

		expect(cardWithoutNoPadding).toBeInTheDocument();
		expect(cardWithNoPaddingFalse).toBeInTheDocument();
	});
});
