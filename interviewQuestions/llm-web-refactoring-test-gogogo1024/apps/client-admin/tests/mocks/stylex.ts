/**
 * Mock for @stylexjs/stylex that works in test environment without babel transformation
 */

type StyleObject = Record<string, string | number | Record<string, string | number>>;
type StylexStyles = Record<string, StyleObject>;

const create = <T extends StylexStyles>(styles: T): T => {
	const result = {} as T;
	for (const key of Object.keys(styles)) {
		result[key as keyof T] = { $$css: true, [key]: key } as unknown as T[keyof T];
	}
	return result;
};

const defineVars = <T extends Record<string, string>>(vars: T): T => {
	return vars;
};

const keyframes = <T extends Record<string, Record<string, string | number>>>(
	_frames: T,
): string => {
	return "mock-keyframes";
};

const props = (
	...styles: (StyleObject | boolean | null | undefined)[]
): { className?: string; style?: Record<string, string> } => {
	const classNames: string[] = [];
	for (const style of styles) {
		if (style && typeof style === "object" && "$$css" in style) {
			classNames.push(
				Object.keys(style)
					.filter((k) => k !== "$$css")
					.join(" "),
			);
		}
	}
	return classNames.length > 0 ? { className: classNames.join(" ") } : {};
};

export default {
	create,
	defineVars,
	keyframes,
	props,
};

export { create, defineVars, keyframes, props };
