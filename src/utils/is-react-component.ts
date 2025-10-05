import type { ComponentType } from "react";

/**
 * Type guard to check if a value is a React component (function component)
 * @param value - The value to check
 * @returns True if the value is a React component function
 */
export function isReactComponent(value: unknown): value is ComponentType<any> {
    return typeof value === "function" && value.prototype === undefined;
}
