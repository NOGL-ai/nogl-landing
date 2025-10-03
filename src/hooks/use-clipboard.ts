import { useCallback, useState } from "react";

interface UseClipboardOptions {
	timeout?: number;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

interface UseClipboardReturn {
	copy: (text: string) => Promise<void>;
	copied: boolean;
	error: Error | null;
}

export function useClipboard(
	options: UseClipboardOptions = {}
): UseClipboardReturn {
	const { timeout = 2000, onSuccess, onError } = options;
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const copy = useCallback(
		async (text: string) => {
			try {
				if (!navigator?.clipboard) {
					throw new Error("Clipboard API not available");
				}

				await navigator.clipboard.writeText(text);
				setCopied(true);
				setError(null);
				onSuccess?.();

				// Reset copied state after timeout
				setTimeout(() => {
					setCopied(false);
				}, timeout);
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Failed to copy text");
				setError(error);
				setCopied(false);
				onError?.(error);
			}
		},
		[timeout, onSuccess, onError]
	);

	return { copy, copied, error };
}
