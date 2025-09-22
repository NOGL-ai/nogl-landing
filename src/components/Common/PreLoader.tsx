"use client";
import { useEffect, useState } from "react";

const Loader = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		setTimeout(() => setLoading(false), 1000);
	}, []);

	// Prevent hydration mismatch by not rendering until mounted
	if (!mounted) {
		return null;
	}

	return (
		<>
			{loading && (
				<div className='fixed left-0 top-0 z-999999 flex h-screen w-screen items-center justify-center bg-white'>
					<div className='h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent'></div>
				</div>
			)}
		</>
	);
};

export default Loader;
