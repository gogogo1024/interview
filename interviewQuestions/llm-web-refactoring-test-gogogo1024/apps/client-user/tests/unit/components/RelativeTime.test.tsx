import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RelativeTime } from "../../../src/components/shared/RelativeTime";

describe("RelativeTime", () => {
	it('shows "just now" for very recent times', () => {
		const now = new Date();
		render(<RelativeTime date={now} />);
		expect(screen.getByText("just now")).toBeInTheDocument();
	});

	it("shows minutes ago for times less than an hour", () => {
		const minutesAgo = new Date(Date.now() - 30 * 60 * 1000);
		render(<RelativeTime date={minutesAgo} />);
		expect(screen.getByText("30m ago")).toBeInTheDocument();
	});

	it("shows hours ago for times less than a day", () => {
		const hoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
		render(<RelativeTime date={hoursAgo} />);
		expect(screen.getByText("5h ago")).toBeInTheDocument();
	});

	it("shows days ago for times less than a week", () => {
		const daysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
		render(<RelativeTime date={daysAgo} />);
		expect(screen.getByText("3d ago")).toBeInTheDocument();
	});

	it("shows formatted date for times older than a week", () => {
		const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
		render(<RelativeTime date={oldDate} />);
		// Just verify a date pattern is shown
		const dateText = screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
		expect(dateText).toBeInTheDocument();
	});
});
