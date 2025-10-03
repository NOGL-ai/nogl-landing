"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useContext } from "react";
import { LoadingContext } from "@/context/LoadingContext";
import type { LottieRefCurrentProps } from "lottie-react";
import loading from "../../../public/animations/loading.json";
import loadingMobile from "../../../public/animations/loading-mobile.json";

// Dynamically import Lottie default export to avoid SSR issues
const Lottie = dynamic(
	() => import("lottie-react").then((mod) => mod.default),
	{
		ssr: false,
		loading: () => (
			<div className='h-full w-full bg-white dark:bg-neutral-900' />
		),
	}
);

const LoadingScreen = () => {
	const [mounted, setMounted] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const lottieRef = useRef<LottieRefCurrentProps>(null);

	// Safely get loading state with fallback
	const loadingContext = useContext(LoadingContext);
	const isLoading = loadingContext?.isLoading ?? false;

	useEffect(() => {
		setMounted(true);
		// Check if window is defined (client-side)
		if (typeof window !== "undefined") {
			// Initial check
			setIsMobile(window.innerWidth <= 768);

			// Add resize listener
			const handleResize = () => {
				setIsMobile(window.innerWidth <= 768);
			};

			window.addEventListener("resize", handleResize);

			// Cleanup
			return () => window.removeEventListener("resize", handleResize);
		}
	}, []);

	useEffect(() => {
		if (lottieRef.current) {
			lottieRef.current.setSpeed(1.0);
		}
	}, []);

	// Prevent hydration mismatch by not rendering until mounted
	if (!mounted || !isLoading) return null;

	return (
		<div className='fixed inset-0 z-[9999] h-full w-full overflow-hidden bg-white dark:bg-neutral-900'>
			<div className='relative flex h-full w-full items-center justify-center'>
				<Lottie
					lottieRef={lottieRef}
					animationData={isMobile ? loadingMobile : loading}
					loop={false}
					autoplay={true}
					className='h-full w-full'
					rendererSettings={{
						preserveAspectRatio: "xMidYMid slice",
						progressiveLoad: true,
					}}
				/>
			</div>
		</div>
	);
};

export default LoadingScreen;
