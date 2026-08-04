import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
	it("renders an input element", () => {
		render(<Input />);
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("accepts and displays user input", async () => {
		const user = userEvent.setup();
		render(<Input />);

		const input = screen.getByRole("textbox");
		await user.type(input, "Hello World");

		expect(input).toHaveValue("Hello World");
	});

	it("renders with placeholder text", () => {
		render(<Input placeholder="Enter your name" />);
		expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
	});

	it("can be disabled", () => {
		render(<Input disabled />);
		expect(screen.getByRole("textbox")).toBeDisabled();
	});

	it("passes through additional props", () => {
		render(<Input name="email" type="email" data-testid="email-input" />);

		const input = screen.getByTestId("email-input");
		expect(input).toHaveAttribute("name", "email");
		expect(input).toHaveAttribute("type", "email");
	});

	it("renders with error state", () => {
		render(<Input error data-testid="error-input" />);
		const input = screen.getByTestId("error-input");
		expect(input).toBeInTheDocument();
	});

	it("handles onChange events", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(<Input onChange={handleChange} />);
		const input = screen.getByRole("textbox");

		await user.type(input, "a");
		expect(handleChange).toHaveBeenCalled();
	});

	it("handles onFocus and onBlur events", async () => {
		const user = userEvent.setup();
		const handleFocus = vi.fn();
		const handleBlur = vi.fn();

		render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
		const input = screen.getByRole("textbox");

		await user.click(input);
		expect(handleFocus).toHaveBeenCalled();

		await user.tab();
		expect(handleBlur).toHaveBeenCalled();
	});

	it("supports controlled input with value prop", async () => {
		render(<Input value="controlled" onChange={() => {}} />);
		const input = screen.getByRole("textbox");
		expect(input).toHaveValue("controlled");
	});

	it("can be read-only", () => {
		render(<Input readOnly value="Read only value" />);
		const input = screen.getByRole("textbox");
		expect(input).toHaveAttribute("readonly");
		expect(input).toHaveValue("Read only value");
	});
});
