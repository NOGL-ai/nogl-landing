"use client";

import React, { useEffect, useState } from "react";
import { MoonIcon } from "@heroicons/react/24/solid";
import { SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";

export interface SwitchDarkModeProps {
	className?: string;
}
const SwitchDarkMode: React.FC<SwitchDarkModeProps> = ({ className = "" }) => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<button
				className={`flex h-12 w-12 items-center justify-center self-center rounded-full text-2xl text-neutral-700 hover:bg-neutral-100 focus:outline-none md:text-3xl dark:text-neutral-300 dark:hover:bg-neutral-800 ${className}`}
			>
				<span className='sr-only'>Enable dark mode</span>
				<MoonIcon className='h-7 w-7' aria-hidden='true' />
			</button>
		);
	}

	const isDarkMode = theme === "dark";

	return (
		<button
			onClick={() => setTheme(isDarkMode ? "light" : "dark")}
			className={`flex h-12 w-12 items-center justify-center self-center rounded-full text-2xl text-neutral-700 hover:bg-neutral-100 focus:outline-none md:text-3xl dark:text-neutral-300 dark:hover:bg-neutral-800 ${className}`}
		>
			<span className='sr-only'>Enable dark mode</span>
			{isDarkMode ? (
				<MoonIcon className='h-7 w-7' aria-hidden='true' />
			) : (
				<SunIcon className='h-7 w-7' aria-hidden='true' />
			)}
		</button>
	);
};

export default SwitchDarkMode;
