"use client";

import React, { useState } from "react";
import {
	FullscreenIcon,
	CustomizeIcon,
	PaintBucketIcon,
} from "../atoms/DashboardIcons";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

interface DashboardPageHeaderProps {
	title?: string;
	onColorToggle?: () => void;
	onFullscreenToggle?: () => void;
	onEditWidgets?: () => void;
	className?: string;
}

const DashboardPageHeader: React.FC<DashboardPageHeaderProps> = ({
	title = "Dashboard",
	onColorToggle,
	onFullscreenToggle,
	onEditWidgets,
	className = "",
}) => {
	const [isFullscreen, setIsFullscreen] = useState(false);
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Ensure component is mounted before rendering theme-dependent content
	React.useEffect(() => {
		setMounted(true);
	}, []);

	const handleThemeToggle = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	const handleFullscreenToggle = () => {
		setIsFullscreen(!isFullscreen);
		if (onFullscreenToggle) {
			onFullscreenToggle();
		}

		// Native fullscreen API
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};

	return (
		<div
			className={`flex min-h-14 w-full flex-col items-start justify-center gap-6 ${className}`}
		>
			<div className='relative flex flex-col gap-3 self-stretch rounded-xl border border-[#F2F2F2] bg-white p-3 sm:flex-row sm:items-center dark:border-border dark:bg-secondary_bg'>
				<div className='relative flex flex-1 items-start gap-1.5'>
					<div className='relative flex flex-1 flex-col items-start gap-1'>
						<h1 className='font-inter relative self-stretch text-xl font-semibold leading-7 tracking-[-0.336px] text-[#14151A] sm:text-2xl sm:leading-8 dark:text-white'>
							{title}
						</h1>
					</div>
				</div>

				<div className='relative flex items-center gap-2 sm:gap-[5px]'>
					{/* Dark Theme Toggle Button */}
					<div className='relative hidden items-center gap-[4.375px] sm:flex'>
						<button
							onClick={handleThemeToggle}
							className='flex h-8 w-8 items-center justify-center rounded-[5px] bg-[rgba(10,15,41,0.04)] transition-colors hover:bg-[rgba(10,15,41,0.08)] dark:bg-gray-700 dark:hover:bg-gray-600'
							title={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Theme toggle"}
							aria-label={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Theme toggle"}
						>
							{mounted ? (
								theme === "dark" ? (
									<SunIcon className="h-4 w-4 text-yellow-500" />
								) : (
									<MoonIcon className="h-4 w-4 text-tertiary dark:text-tertiary" />
								)
							) : (
								<MoonIcon className="h-4 w-4 text-tertiary" />
							)}
						</button>
					</div>

					{/* Color Button */}
					<div className='relative hidden items-center gap-[4.375px] sm:flex'>
						<div className='relative flex h-3.5 w-3.5 items-center justify-center'>
							<div className='absolute left-[-1px] top-[-1px] flex h-4 w-4 flex-shrink-0 items-center justify-center'>
								<PaintBucketIcon />
							</div>
						</div>
						<button
							onClick={onColorToggle}
							className='font-inter text-center text-sm font-medium leading-5 tracking-[-0.07px] text-[#14151A] transition-opacity hover:opacity-70 dark:text-white'
						>
							Color
						</button>
					</div>

					{/* Actions Container */}
					<div className='relative flex items-start gap-2'>
						{/* Fullscreen Button */}
						<button
							onClick={handleFullscreenToggle}
							className='flex items-center justify-center gap-0.5 rounded-[5px] bg-[rgba(10,15,41,0.04)] p-2 px-2.5 transition-colors hover:bg-[rgba(10,15,41,0.08)] dark:bg-gray-700 dark:hover:bg-gray-600'
							title='Toggle Fullscreen'
						>
							<FullscreenIcon />
						</button>

						{/* Edit Widgets Button */}
						<button
							onClick={onEditWidgets}
							className='flex h-8 w-auto items-center justify-center gap-0.5 rounded-[5px] border border-[#E2E4E9] bg-white p-1.5 px-2.5 shadow-[0_1px_2px_0_rgba(20,21,26,0.05)] transition-colors hover:bg-secondary_bg sm:w-[131px] dark:border-border dark:bg-gray-700 dark:hover:bg-gray-600'
						>
							<div className='flex h-4 w-4 flex-shrink-0 items-center justify-center p-[1.333px]'>
								<CustomizeIcon />
							</div>
							<span className='font-inter hidden text-center text-sm font-medium leading-5 tracking-[-0.07px] text-[#14151A] sm:inline dark:text-white'>
								Edit Widgets
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardPageHeader;
