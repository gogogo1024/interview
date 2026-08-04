import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PostForm } from "../../../src/components/posts/PostForm";

vi.mock("../../../src/server/functions/posts", () => ({
	createPost: vi.fn(),
}));

describe("PostForm", () => {
	it("renders textarea and submit button", () => {
		render(<PostForm />);
		expect(screen.getByPlaceholderText(/what's happening/i)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /post/i })).toBeInTheDocument();
	});

	it("shows character count", () => {
		render(<PostForm />);
		expect(screen.getByText("0/280")).toBeInTheDocument();
	});

	it("updates character count when typing", () => {
		render(<PostForm />);
		const textarea = screen.getByPlaceholderText(/what's happening/i);
		fireEvent.change(textarea, { target: { value: "Hello" } });
		expect(screen.getByText("5/280")).toBeInTheDocument();
	});

	it("disables submit button when content is empty", () => {
		render(<PostForm />);
		const button = screen.getByRole("button", { name: /post/i });
		expect(button).toBeDisabled();
	});

	it("enables submit button when content is entered", () => {
		render(<PostForm />);
		const textarea = screen.getByPlaceholderText(/what's happening/i);
		const button = screen.getByRole("button", { name: /post/i });

		fireEvent.change(textarea, { target: { value: "Test content" } });
		expect(button).not.toBeDisabled();
	});

	it("disables submit button when content exceeds 280 characters", () => {
		render(<PostForm />);
		const textarea = screen.getByPlaceholderText(/what's happening/i);
		const button = screen.getByRole("button", { name: /post/i });

		const longContent = "a".repeat(281);
		fireEvent.change(textarea, { target: { value: longContent } });
		expect(button).toBeDisabled();
	});
});
