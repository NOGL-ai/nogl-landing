"use client";

import { useCallback, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type MobilePreviewFrameProps = {
	children: ReactNode;
	className?: string;
	width?: number;
};

const BEZEL_PATH =
	"M52,0 L448,0 Q500,0 500,52 L500,928 Q500,980 448,980 L52,980 Q0,980 0,928 L0,52 Q0,0 52,0 Z " +
	"M56,52 L444,52 Q484,52 484,92 L484,912 Q484,952 444,952 L56,952 Q16,952 16,912 L16,92 Q16,52 56,52 Z";

function PhoneBezelSVG() {
	return (
		<svg
			viewBox="0 0 500 980"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 z-20 h-full w-full"
			style={{
				filter:
					"drop-shadow(0 32px 72px rgba(0,0,0,.55)) drop-shadow(0 6px 18px rgba(0,0,0,.28))",
			}}
		>
			<path fillRule="evenodd" d={BEZEL_PATH} fill="#1b1b1f" />
			<path
				d="M52,0 L448,0 Q500,0 500,52 L500,928 Q500,980 448,980 L52,980 Q0,980 0,928 L0,52 Q0,0 52,0 Z"
				fill="none"
				stroke="rgba(255,255,255,0.09)"
				strokeWidth="1.2"
			/>
			<path
				d="M56,52 L444,52 Q484,52 484,92 L484,912 Q484,952 444,952 L56,952 Q16,952 16,912 L16,92 Q16,52 56,52 Z"
				fill="none"
				stroke="rgba(0,0,0,0.2)"
				strokeWidth="1"
			/>
			<rect x="185" y="64" width="130" height="32" rx="16" fill="#1b1b1f" />
			<rect x="200" y="930" width="100" height="5" rx="2.5" fill="rgba(255,255,255,0.22)" />
			<rect x="498" y="108" width="4" height="74" rx="2" fill="#2a2a2f" />
			<rect x="-2" y="86" width="4" height="40" rx="2" fill="#2a2a2f" />
			<rect x="-2" y="138" width="4" height="68" rx="2" fill="#2a2a2f" />
			<rect x="-2" y="218" width="4" height="68" rx="2" fill="#2a2a2f" />
			<path
				d="M52,0 L448,0 Q500,0 500,52 L500,340 Q340,300 160,340 L0,340 L0,52 Q0,0 52,0 Z"
				fill="rgba(255,255,255,0.055)"
			/>
		</svg>
	);
}

export function MobilePreviewFrame({ children, className, width = 280 }: MobilePreviewFrameProps) {
	const height = Math.round((width / 500) * 980);
	const sx = Math.round((16 / 500) * width);
	const sy = Math.round((52 / 980) * height);
	const sb = Math.round((28 / 980) * height);
	const sr = Math.round((40 / 500) * width);

	const scrollRef = useRef<HTMLDivElement>(null);
	const [scrollPct, setScrollPct] = useState(0);
	const [atTop, setAtTop] = useState(true);
	const [atBottom, setAtBottom] = useState(false);
	const [hinted, setHinted] = useState(false);

	const handleScroll = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		const max = el.scrollHeight - el.clientHeight;
		const pct = max > 0 ? el.scrollTop / max : 0;
		setScrollPct(pct);
		setAtTop(el.scrollTop < 6);
		setAtBottom(el.scrollTop >= max - 4);
		if (!hinted && el.scrollTop > 16) setHinted(true);
	}, [hinted]);

	return (
		<div className={`mx-auto flex flex-col items-center gap-3 ${className ?? ""}`}>
			<div className="relative flex-shrink-0" style={{ width, height }}>
				<div
					ref={scrollRef}
					onScroll={handleScroll}
					className="absolute overflow-x-hidden overflow-y-scroll"
					style={{
						scrollbarWidth: "none",
						WebkitOverflowScrolling: "touch" as CSSProperties["WebkitOverflowScrolling"],
						left: sx,
						top: sy,
						right: sx,
						bottom: sb,
						borderRadius: sr,
						zIndex: 0,
					}}
				>
					{children}
				</div>

				<div
					className="pointer-events-none absolute z-10 transition-opacity duration-200"
					style={{
						left: sx,
						top: sy,
						right: sx,
						height: 40,
						borderRadius: `${sr}px ${sr}px 0 0`,
						background: "linear-gradient(to bottom, rgba(255,255,255,.92), transparent)",
						opacity: atTop ? 0 : 1,
					}}
				/>

				<div
					className="pointer-events-none absolute z-10 transition-opacity duration-200"
					style={{
						left: sx,
						top: sy + height - sb - 48,
						right: sx,
						height: 48,
						borderRadius: `0 0 ${sr}px ${sr}px`,
						background: "linear-gradient(to top, rgba(255,255,255,.88), transparent)",
						opacity: atBottom ? 0 : 1,
					}}
				/>

				<PhoneBezelSVG />
			</div>

			<div className="flex flex-col items-center gap-1.5">
				<div className="h-0.5 w-28 overflow-hidden rounded-full bg-bg-tertiary">
					<div
						className="h-full rounded-full bg-brand-400 transition-[width] duration-75"
						style={{ width: `${scrollPct * 100}%` }}
					/>
				</div>
				{!hinted ? (
					<p className="animate-bounce text-[11px] font-medium text-text-tertiary">Scroll to explore ↓</p>
				) : null}
			</div>
		</div>
	);
}
