import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextArea } from "./TextArea";

describe("TextArea", () => {
	it("renders a textarea element", () => {
		render(<TextArea />);
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("accepts and displays user input", async () => {
		const user = userEvent.setup();
		render(<TextArea />);

		const textarea = screen.getByRole("textbox");
		await user.type(textarea, "Hello World\nNew Line");

		expect(textarea).toHaveValue("Hello World\nNew Line");
	});

	it("renders with placeholder text", () => {
		render(<TextArea placeholder="Enter your message" />);
		expect(screen.getByPlaceholderText("Enter your message")).toBeInTheDocument();
	});

	it("can be disabled", () => {
		render(<TextArea disabled />);
		expect(screen.getByRole("textbox")).toBeDisabled();
	});

	it("passes through additional props", () => {
		render(<TextArea name="message" rows={5} data-testid="message-textarea" />);

		const textarea = screen.getByTestId("message-textarea");
		expect(textarea).toHaveAttribute("name", "message");
		expect(textarea).toHaveAttribute("rows", "5");
	});

	it("renders with borderless style", () => {
		render(<TextArea borderless data-testid="borderless-textarea" />);
		const textarea = screen.getByTestId("borderless-textarea");
		expect(textarea).toBeInTheDocument();
	});

	it("handles onChange events", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(<TextArea onChange={handleChange} />);
		const textarea = screen.getByRole("textbox");

		await user.type(textarea, "a");
		expect(handleChange).toHaveBeenCalled();
	});

	it("handles onFocus and onBlur events", async () => {
		const user = userEvent.setup();
		const handleFocus = vi.fn();
		const handleBlur = vi.fn();

		render(<TextArea onFocus={handleFocus} onBlur={handleBlur} />);
		const textarea = screen.getByRole("textbox");

		await user.click(textarea);
		expect(handleFocus).toHaveBeenCalled();

		await user.tab();
		expect(handleBlur).toHaveBeenCalled();
	});

	it("supports controlled textarea with value prop", () => {
		render(<TextArea value="controlled content" onChange={() => {}} />);
		const textarea = screen.getByRole("textbox");
		expect(textarea).toHaveValue("controlled content");
	});

	it("can be read-only", () => {
		render(<TextArea readOnly value="Read only content" />);
		const textarea = screen.getByRole("textbox");
		expect(textarea).toHaveAttribute("readonly");
		expect(textarea).toHaveValue("Read only content");
	});

	it("supports maxLength attribute", async () => {
		const user = userEvent.setup();
		render(<TextArea maxLength={10} />);

		const textarea = screen.getByRole("textbox");
		await user.type(textarea, "This is a long text that exceeds the limit");

		expect(textarea).toHaveValue("This is a ");
	});
});
