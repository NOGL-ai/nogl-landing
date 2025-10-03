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
				<div className='z-999999 fixed left-0 top-0 flex h-screen w-screen items-center justify-center bg-white'>
					<div className='border-primary h-16 w-16 animate-spin rounded-full border-4 border-solid border-t-transparent'></div>
				</div>
			)}
		</>
	);
};

export default Loader;
