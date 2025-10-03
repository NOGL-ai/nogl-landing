import { isValidElement, type ReactElement } from "react";

/**
 * Checks if a value is a valid React element
 */
export function isReactElement(value: unknown): value is ReactElement {
	return isValidElement(value);
}

/**
 * Checks if a value is a React component (function or class)
 */
export function isReactComponent(
	value: unknown
): value is React.ComponentType<unknown> {
	return (
		typeof value === "function" &&
		(value.prototype?.isReactComponent ||
			(value as { $$typeof?: unknown }).$$typeof)
	);
}
