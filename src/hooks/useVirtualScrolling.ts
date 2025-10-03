import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useEffect, useState, useCallback } from "react";

interface UseVirtualScrollingOptions {
	itemCount: number;
	itemHeight?: number;
	overscan?: number;
	threshold?: number; // Minimum items to enable virtualization
	enabled?: boolean;
	parentRef?: React.RefObject<HTMLDivElement>;
}

interface UseVirtualScrollingReturn {
	virtualizer: ReturnType<typeof useVirtualizer<HTMLElement, Element>>;
	parentRef: React.RefObject<HTMLDivElement>;
	shouldVirtualize: boolean;
	isClient: boolean;
	virtualItems: any[];
	totalSize: number;
	scrollToIndex: (index: number, align?: "start" | "center" | "end") => void;
	scrollToOffset: (offset: number, align?: "start" | "center" | "end") => void;
}

export const useVirtualScrolling = ({
	itemCount,
	itemHeight = 50,
	overscan = 5,
	threshold = 1000,
	enabled = true,
	parentRef: externalParentRef,
}: UseVirtualScrollingOptions): UseVirtualScrollingReturn => {
	const internalParentRef = useRef<HTMLDivElement>(null);
	const parentRef = externalParentRef || internalParentRef;
	const [isClient, setIsClient] = useState(false);
	const [shouldVirtualize, setShouldVirtualize] = useState(false);

	// Determine if we should use virtualization
	useEffect(() => {
		setIsClient(true);
		setShouldVirtualize(enabled && itemCount >= threshold);
	}, [enabled, itemCount, threshold]);

	// Virtual scrolling setup
	const virtualizer = useVirtualizer({
		count: shouldVirtualize ? itemCount : 0,
		getScrollElement: () => parentRef.current as HTMLElement | null,
		estimateSize: useCallback(() => itemHeight, [itemHeight]),
		overscan,
	});

	// Scroll utilities
	const scrollToIndex = useCallback(
		(index: number, align: "start" | "center" | "end" = "start") => {
			if (shouldVirtualize && virtualizer) {
				virtualizer.scrollToIndex(index, { align });
			}
		},
		[shouldVirtualize, virtualizer]
	);

	const scrollToOffset = useCallback(
		(offset: number, align: "start" | "center" | "end" = "start") => {
			if (shouldVirtualize && virtualizer) {
				virtualizer.scrollToOffset(offset, { align });
			}
		},
		[shouldVirtualize, virtualizer]
	);

	return {
		virtualizer,
		parentRef,
		shouldVirtualize,
		isClient,
		virtualItems: shouldVirtualize ? virtualizer.getVirtualItems() : [],
		totalSize: shouldVirtualize ? virtualizer.getTotalSize() : 0,
		scrollToIndex,
		scrollToOffset,
	};
};

export default useVirtualScrolling;
