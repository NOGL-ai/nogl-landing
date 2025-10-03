"use client";

import React, { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSidebar } from "@/hooks/useSidebar";
import { UserProfile } from "@/types/navigation";
import { SidebarNavigationSectionsSubheadings } from "@/components/application/app-navigation/sidebar-navigation/sidebar-sections-subheadings";
import { SidebarFooter } from "@/components/application/app-navigation/sidebar-footer";
import { SidebarSearch } from "@/components/application/app-navigation/sidebar-search";
import { navItemsWithSectionsSubheadings } from "@/data/navigationItems";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/base/error-boundary";
import { LoadingSpinner } from "@/components/base/loading-spinner";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "next-themes";
import "@/styles/sidebar-animations.css";

interface SidebarLayoutProps {
	children: React.ReactNode;
	user?: UserProfile;
	onLogout?: () => void;
	className?: string;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
	children,
	user,
	onLogout,
	className = "",
}) => {
	const {
		isCollapsed,
		isMobileOpen,
		isHovered,
		toggleCollapse,
		openMobile,
		closeMobile,
		toggleMobile,
		setHovered,
	} = useSidebar();

	const pathname = usePathname();
	const sidebarRef = useRef<HTMLDivElement>(null);
	const toggleButtonRef = useRef<HTMLButtonElement>(null);
	const mobileToggleRef = useRef<HTMLButtonElement>(null);
	const [isKeyboardUser, setIsKeyboardUser] = useState(false);
	const { theme, setTheme } = useTheme();
	const { isMobile, isTablet, isDesktop } = useResponsive();

	const toggleTheme = useCallback(() => {
		setTheme(theme === 'light' ? 'dark' : 'light');
	}, [theme, setTheme]);

	// Detect keyboard usage for better UX
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Tab') {
				setIsKeyboardUser(true);
			}
		};

		const handleMouseDown = () => {
			setIsKeyboardUser(false);
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('mousedown', handleMouseDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleMouseDown);
		};
	}, []);

	// Keyboard navigation handlers
	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			if (isMobileOpen) {
				closeMobile();
				mobileToggleRef.current?.focus();
			} else if (isCollapsed) {
				toggleCollapse();
				toggleButtonRef.current?.focus();
			}
		}
		// Alt + S to toggle sidebar
		if (e.altKey && e.key === 's') {
			e.preventDefault();
			toggleCollapse();
		}
		// Alt + M to toggle mobile sidebar
		if (e.altKey && e.key === 'm') {
			e.preventDefault();
			toggleMobile();
		}
		// Alt + T to toggle theme
		if (e.altKey && e.key === 't') {
			e.preventDefault();
			toggleTheme();
		}
	}, [isMobileOpen, isCollapsed, closeMobile, toggleCollapse, toggleMobile, toggleTheme]);

	// Focus management
	useEffect(() => {
		if (isMobileOpen && mobileToggleRef.current) {
			mobileToggleRef.current.focus();
		}
	}, [isMobileOpen]);

	// Close mobile sidebar when switching to desktop
	useEffect(() => {
		if (isDesktop && isMobileOpen) {
			closeMobile();
		}
	}, [isDesktop, isMobileOpen, closeMobile]);

	const handleLogout = useCallback(() => {
		if (onLogout) {
			onLogout();
		}
		// Add your logout logic here
		// For example: signOut(), redirect to login page, etc.
	}, [onLogout]);


	return (
		<div className={`flex h-screen ${className}`} onKeyDown={handleKeyDown}>
			{/* Skip to main content link for screen readers */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-secondary focus:rounded-md focus:shadow-lg"
			>
				Skip to main content
			</a>

			{/* Desktop Sidebar */}
			<aside
				ref={sidebarRef}
				className='fixed left-0 top-0 z-50 hidden lg:block'
				role="navigation"
				aria-label="Main navigation"
				aria-expanded={!isCollapsed || isHovered}
			>
				<div 
					className={`flex h-full ${theme === 'dark' ? 'bg-[#0a0d12] border-[#252b37]' : 'bg-white border-[#e9eaeb]'} border sidebar-width-transition ${
						isCollapsed && !isHovered ? "w-16" : "w-80"
					} ${isKeyboardUser ? 'focus-within:ring-2 focus-within:ring-blue-500' : ''} sidebar-hover-effect rounded-r-[12px]`}
					onMouseEnter={() => setHovered(true)}
					onMouseLeave={() => setHovered(false)}
					tabIndex={-1}
				>
					<div className="flex flex-col w-full">
						{/* Logo and Toggle */}
						<div className="flex items-center justify-between px-5 py-5">
							<div className="flex items-center">
								<div className="h-8 w-8 relative">
									<div className="border-[0.2px] border-[rgba(10,13,18,0.12)] border-solid relative rounded-[8px] shrink-0 size-[32px]" style={{ backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(10, 13, 18, 0.2) 100%), linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 100%)" }}>
										<div className="overflow-clip relative rounded-[inherit] size-[32px]">
											<div className="absolute inset-0">
												<svg
													width='32'
													height='32'
													viewBox='0 0 30 30'
													fill='none'
													xmlns='http://www.w3.org/2000/svg'
													className="block max-w-none size-full"
												>
													<path
														d='M18.7422 19.5789C19.2754 19.5789 19.9931 18.9436 23.9712 14.9676C26.514 12.4263 28.6876 10.3564 28.7901 10.3564C28.9132 10.3564 29.1182 10.4383 29.2412 10.5203C29.3848 10.6023 29.6104 11.1762 29.7539 11.791C29.8974 12.4058 30 13.8814 30 15.0701C30 16.4227 29.8769 17.7139 29.6514 18.5542C29.4668 19.292 28.8926 20.7266 28.4005 21.7308C27.7648 23.022 27.0881 24.0262 26.1039 25.0919C25.3246 25.9117 24.0943 26.9979 23.3561 27.4897C22.6384 27.9611 21.4695 28.5965 20.7928 28.8834C20.1161 29.1498 18.7833 29.5392 17.8195 29.7441C16.5686 29.9901 15.5843 30.0515 14.231 29.9696C13.2262 29.9081 11.8318 29.7031 11.1551 29.5392C10.4784 29.3547 9.14549 28.8219 8.20222 28.3505C7.17693 27.8177 5.94658 26.9774 5.14685 26.2396C4.40864 25.5633 3.46537 24.5796 3.03474 24.0467C2.48109 23.3704 2.23502 22.858 2.23502 22.4071C2.23502 21.8128 2.68614 21.2799 6.50024 17.4884C9.78118 14.1888 10.868 13.2256 11.2576 13.2256C11.6472 13.2461 12.5905 14.0454 14.9487 16.4022C17.6349 19.0665 18.2296 19.5584 18.7422 19.5789Z'
														fill='#375DFB'
													/>
													<path
														d='M10.5605 0.643081C11.1142 0.458631 12.1395 0.233187 12.8162 0.130715C13.4929 0.00774801 14.8257 -0.0332346 15.7895 0.0282489C16.7533 0.0692378 18.0862 0.253698 18.7629 0.417653C19.4396 0.602104 20.5469 0.991487 21.2236 1.2989C21.9003 1.62682 22.9051 2.20067 23.4792 2.56957C24.0329 2.95897 24.8736 3.59429 25.3042 4.00418C25.7554 4.39358 26.5141 5.27484 27.0062 5.95116C27.4984 6.62747 27.9085 7.38578 27.888 7.63171C27.888 7.93913 27.3343 8.67693 26.3911 9.64017C25.5913 10.5009 24.7506 11.1772 24.5455 11.1772C24.3405 11.1772 23.8893 10.6854 23.4587 9.98857C23.0486 9.35325 22.4744 8.55396 22.1668 8.22605C21.8798 7.89814 21.08 7.2833 20.4033 6.83242C19.7267 6.40203 18.5783 5.84869 17.8401 5.62325C17.0404 5.37732 15.9331 5.23386 15.0718 5.23386C14.2721 5.23386 13.1648 5.35683 12.6111 5.52078C12.0369 5.66425 11.0937 6.03313 10.499 6.32005C9.92484 6.62747 9.00208 7.2628 8.46893 7.73418C7.95628 8.22605 7.23857 9.06633 6.86947 9.64017C6.52087 10.1935 6.04923 11.0748 5.86468 11.5871C5.65962 12.0995 5.41355 13.2882 5.14697 15.9935L3.34246 17.797C2.35818 18.7807 1.37389 19.58 1.16883 19.58C0.984282 19.58 0.738211 19.4161 0.635682 19.2111C0.533153 19.0267 0.3486 18.2683 0.225565 17.5305C0.102529 16.7927 0 15.6246 0 14.9073C0 14.2104 0.143541 12.9193 0.328094 12.038C0.512647 11.1773 0.881753 9.90659 1.16883 9.23027C1.45592 8.55396 2.07109 7.40627 2.56323 6.66847C3.03487 5.93066 4.08067 4.74198 4.85989 4.00418C5.70063 3.2049 6.95149 2.32365 7.91527 1.83178C8.79702 1.36041 9.98636 0.827532 10.5605 0.643081Z'
														fill='#00C8F4'
													/>
												</svg>
											</div>
											<div className="absolute backdrop-blur-[2.5px] backdrop-filter bg-[rgba(255,255,255,0.2)] bottom-0 left-0 right-0 rounded-bl-[8px] rounded-br-[8px] top-1/2" />
										</div>
										<div className="absolute inset-0 pointer-events-none shadow-[inset_0px_-0.5px_0.5px_0px_rgba(10,13,18,0.1)]" />
									</div>
								</div>
								{(!isCollapsed || isHovered) && (
									<span className={`ml-2 text-lg font-semibold ${theme === 'dark' ? 'text-[#e9eaeb]' : 'text-[#181d27]'}`}>NOGL</span>
								)}
							</div>
							<div className="flex items-center gap-2">
								{/* Theme Toggle Button */}
								<button
									type='button'
									className={`text-[#717680] hover:text-[#a4a7ae] p-1 rounded-md ${theme === 'dark' ? 'hover:bg-[#252b37]/50' : 'hover:bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${theme === 'dark' ? 'focus:ring-offset-[#0a0d12]' : 'focus:ring-offset-white'} sidebar-focus-ring sidebar-hover-effect transition-all duration-200 ${
										(!isCollapsed || isHovered) ? 'opacity-100' : 'opacity-0 pointer-events-none'
									}`}
									onClick={toggleTheme}
									aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
									title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme (Alt + T)`}
									data-tooltip={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
								>
									<svg
										className='h-5 w-5'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth='1.5'
										stroke='currentColor'
										aria-hidden='true'
									>
										{theme === 'light' ? (
											// Moon icon for dark mode
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z'
											/>
										) : (
											// Sun icon for light mode
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z'
											/>
										)}
									</svg>
								</button>

								{/* Collapse Toggle Button */}
								<button
									ref={toggleButtonRef}
									type='button'
									className={`text-[#717680] hover:text-[#a4a7ae] p-1 rounded-md ${theme === 'dark' ? 'hover:bg-[#252b37]/50' : 'hover:bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${theme === 'dark' ? 'focus:ring-offset-[#0a0d12]' : 'focus:ring-offset-white'} sidebar-focus-ring sidebar-hover-effect transition-all duration-200 ${
										(!isCollapsed || isHovered) ? 'opacity-100' : 'opacity-0 pointer-events-none'
									}`}
									onClick={toggleCollapse}
									aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
									aria-expanded={!isCollapsed}
									title={isCollapsed ? 'Expand sidebar (Alt + S)' : 'Collapse sidebar (Alt + S)'}
									data-tooltip={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
								>
									<svg
										className='h-5 w-5'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth='1.5'
										stroke='currentColor'
										aria-hidden='true'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d={isCollapsed ? 'M9 9l6 6m0-6l-6 6' : 'M15 9l-6 6m0-6l6 6'}
										/>
									</svg>
								</button>
							</div>
						</div>

						{/* Search */}
						{(!isCollapsed || isHovered) && (
							<div className="px-4 pb-4">
								<SidebarSearch 
									placeholder="Search"
									theme={theme}
									onSearch={(query) => {
										// Handle search functionality
										console.log('Search query:', query);
									}}
								/>
							</div>
						)}

					{/* Navigation */}
					<div className="flex-1 overflow-y-auto px-4 py-5">
						<ErrorBoundary
							fallback={
								<div className="p-4 text-center">
									<div className="text-red-600 text-sm">
										Failed to load navigation. Please refresh the page.
									</div>
								</div>
							}
						>
							<Suspense fallback={<LoadingSpinner size="sm" className="p-4" />}>
								<SidebarNavigationSectionsSubheadings 
									activeUrl={pathname} 
									items={navItemsWithSectionsSubheadings}
									theme={theme}
								/>
							</Suspense>
						</ErrorBoundary>
					</div>

						{/* Sidebar Footer */}
						<ErrorBoundary
							fallback={
								<div className="px-4 py-4 text-center text-red-600 text-sm">
									Failed to load sidebar footer
								</div>
							}
						>
							<SidebarFooter 
								user={user}
								onLogout={handleLogout}
								isCollapsed={isCollapsed}
								isHovered={isHovered}
								theme={theme}
							/>
						</ErrorBoundary>
					</div>
				</div>
			</aside>

			{/* Mobile Sidebar - Collapsed State */}
			<div className="lg:hidden fixed left-0 top-0 z-50">
				<div className={`${theme === 'dark' ? 'bg-[#0a0d12]' : 'bg-white border-r border-[#e9eaeb]'} flex flex-col items-center h-full w-16`}>
					<div className="flex flex-1 items-center justify-between px-4 py-3 w-full">
						{/* Logo */}
						<div className="flex items-center">
							<div className="h-8 w-8 relative">
								<div className="border-[0.2px] border-[rgba(10,13,18,0.12)] border-solid relative rounded-[8px] shrink-0 size-[32px]" style={{ backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(10, 13, 18, 0.2) 100%), linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 100%)" }}>
									<div className="overflow-clip relative rounded-[inherit] size-[32px]">
										<div className="absolute inset-0">
											<svg
												width='32'
												height='32'
												viewBox='0 0 30 30'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'
												className="block max-w-none size-full"
											>
												<path
													d='M18.7422 19.5789C19.2754 19.5789 19.9931 18.9436 23.9712 14.9676C26.514 12.4263 28.6876 10.3564 28.7901 10.3564C28.9132 10.3564 29.1182 10.4383 29.2412 10.5203C29.3848 10.6023 29.6104 11.1762 29.7539 11.791C29.8974 12.4058 30 13.8814 30 15.0701C30 16.4227 29.8769 17.7139 29.6514 18.5542C29.4668 19.292 28.8926 20.7266 28.4005 21.7308C27.7648 23.022 27.0881 24.0262 26.1039 25.0919C25.3246 25.9117 24.0943 26.9979 23.3561 27.4897C22.6384 27.9611 21.4695 28.5965 20.7928 28.8834C20.1161 29.1498 18.7833 29.5392 17.8195 29.7441C16.5686 29.9901 15.5843 30.0515 14.231 29.9696C13.2262 29.9081 11.8318 29.7031 11.1551 29.5392C10.4784 29.3547 9.14549 28.8219 8.20222 28.3505C7.17693 27.8177 5.94658 26.9774 5.14685 26.2396C4.40864 25.5633 3.46537 24.5796 3.03474 24.0467C2.48109 23.3704 2.23502 22.858 2.23502 22.4071C2.23502 21.8128 2.68614 21.2799 6.50024 17.4884C9.78118 14.1888 10.868 13.2256 11.2576 13.2256C11.6472 13.2461 12.5905 14.0454 14.9487 16.4022C17.6349 19.0665 18.2296 19.5584 18.7422 19.5789Z'
													fill='#375DFB'
												/>
												<path
													d='M10.5605 0.643081C11.1142 0.458631 12.1395 0.233187 12.8162 0.130715C13.4929 0.00774801 14.8257 -0.0332346 15.7895 0.0282489C16.7533 0.0692378 18.0862 0.253698 18.7629 0.417653C19.4396 0.602104 20.5469 0.991487 21.2236 1.2989C21.9003 1.62682 22.9051 2.20067 23.4792 2.56957C24.0329 2.95897 24.8736 3.59429 25.3042 4.00418C25.7554 4.39358 26.5141 5.27484 27.0062 5.95116C27.4984 6.62747 27.9085 7.38578 27.888 7.63171C27.888 7.93913 27.3343 8.67693 26.3911 9.64017C25.5913 10.5009 24.7506 11.1772 24.5455 11.1772C24.3405 11.1772 23.8893 10.6854 23.4587 9.98857C23.0486 9.35325 22.4744 8.55396 22.1668 8.22605C21.8798 7.89814 21.08 7.2833 20.4033 6.83242C19.7267 6.40203 18.5783 5.84869 17.8401 5.62325C17.0404 5.37732 15.9331 5.23386 15.0718 5.23386C14.2721 5.23386 13.1648 5.35683 12.6111 5.52078C12.0369 5.66425 11.0937 6.03313 10.499 6.32005C9.92484 6.62747 9.00208 7.2628 8.46893 7.73418C7.95628 8.22605 7.23857 9.06633 6.86947 9.64017C6.52087 10.1935 6.04923 11.0748 5.86468 11.5871C5.65962 12.0995 5.41355 13.2882 5.14697 15.9935L3.34246 17.797C2.35818 18.7807 1.37389 19.58 1.16883 19.58C0.984282 19.58 0.738211 19.4161 0.635682 19.2111C0.533153 19.0267 0.3486 18.2683 0.225565 17.5305C0.102529 16.7927 0 15.6246 0 14.9073C0 14.2104 0.143541 12.9193 0.328094 12.038C0.512647 11.1773 0.881753 9.90659 1.16883 9.23027C1.45592 8.55396 2.07109 7.40627 2.56323 6.66847C3.03487 5.93066 4.08067 4.74198 4.85989 4.00418C5.70063 3.2049 6.95149 2.32365 7.91527 1.83178C8.79702 1.36041 9.98636 0.827532 10.5605 0.643081Z'
													fill='#00C8F4'
												/>
											</svg>
										</div>
										<div className="absolute backdrop-blur-[2.5px] backdrop-filter bg-[rgba(255,255,255,0.2)] bottom-0 left-0 right-0 rounded-bl-[8px] rounded-br-[8px] top-1/2" />
									</div>
									<div className="absolute inset-0 pointer-events-none shadow-[inset_0px_-0.5px_0.5px_0px_rgba(10,13,18,0.1)]" />
								</div>
							</div>
						</div>
						
						{/* Hamburger menu button */}
						<button
							ref={mobileToggleRef}
							type='button'
							className={`${theme === 'dark' ? 'bg-[#0a0d12]' : 'bg-gray-50'} cursor-pointer flex gap-2 items-center justify-center overflow-clip p-2 rounded-[8px]`}
							onClick={openMobile}
							aria-label='Open mobile navigation menu'
							aria-expanded={isMobileOpen}
							title='Open mobile navigation menu'
						>
							<div className="overflow-clip relative shrink-0 size-6">
								<svg
									className='h-6 w-6'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth='1.5'
									stroke='currentColor'
									aria-hidden='true'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
									/>
								</svg>
							</div>
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Sidebar - Expanded State */}
			<div 
				className={`lg:hidden fixed inset-0 z-50 ${isMobileOpen ? 'block' : 'hidden'}`}
				role="dialog"
				aria-modal="true"
				aria-label="Mobile navigation menu"
			>
				{/* Background overlay with blur effect */}
				<div 
					className={`fixed inset-0 backdrop-blur sidebar-backdrop transition-opacity duration-300 ${
						isMobileOpen ? 'sidebar-fade-in' : 'sidebar-fade-out'
					}`}
					onClick={closeMobile}
					aria-hidden="true"
				>
					<div className="absolute bg-[#0a0d12] inset-0 opacity-70" />
				</div>
				
				{/* Mobile sidebar content */}
				<div 
					className={`fixed left-0 top-0 h-full w-80 ${theme === 'dark' ? 'bg-[#0a0d12]' : 'bg-white border-r border-[#e9eaeb]'} transform transition-transform duration-300 ease-in-out shadow-[0px_20px_24px_-4px_rgba(10,13,18,0.08),0px_8px_8px_-4px_rgba(10,13,18,0.03),0px_3px_3px_-1.5px_rgba(10,13,18,0.04)] ${
						isMobileOpen ? 'sidebar-slide-in' : 'sidebar-slide-out'
					}`}
					style={{
						transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)'
					}}
				>
					{/* Close button */}
					<button
						className="absolute box-border cursor-pointer flex gap-2 items-center justify-center overflow-clip p-2 right-2 rounded-[8px] top-3 z-10"
						onClick={closeMobile}
						aria-label="Close mobile navigation menu"
					>
						<div className="opacity-70 overflow-clip relative shrink-0 size-6">
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="1.5"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</div>
					</button>
					<div className="flex flex-col h-full">
						{/* Mobile header with logo */}
						<div className="flex items-center px-4 py-4">
							<div className="flex items-center gap-2">
								<div className="h-8 w-8 relative">
									<div className="border-[0.2px] border-[rgba(10,13,18,0.12)] border-solid relative rounded-[8px] shrink-0 size-[32px]" style={{ backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(10, 13, 18, 0.2) 100%), linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 100%)" }}>
										<div className="overflow-clip relative rounded-[inherit] size-[32px]">
											<div className="absolute inset-0">
												<svg
													width='32'
													height='32'
													viewBox='0 0 30 30'
													fill='none'
													xmlns='http://www.w3.org/2000/svg'
													className="block max-w-none size-full"
												>
													<path
														d='M18.7422 19.5789C19.2754 19.5789 19.9931 18.9436 23.9712 14.9676C26.514 12.4263 28.6876 10.3564 28.7901 10.3564C28.9132 10.3564 29.1182 10.4383 29.2412 10.5203C29.3848 10.6023 29.6104 11.1762 29.7539 11.791C29.8974 12.4058 30 13.8814 30 15.0701C30 16.4227 29.8769 17.7139 29.6514 18.5542C29.4668 19.292 28.8926 20.7266 28.4005 21.7308C27.7648 23.022 27.0881 24.0262 26.1039 25.0919C25.3246 25.9117 24.0943 26.9979 23.3561 27.4897C22.6384 27.9611 21.4695 28.5965 20.7928 28.8834C20.1161 29.1498 18.7833 29.5392 17.8195 29.7441C16.5686 29.9901 15.5843 30.0515 14.231 29.9696C13.2262 29.9081 11.8318 29.7031 11.1551 29.5392C10.4784 29.3547 9.14549 28.8219 8.20222 28.3505C7.17693 27.8177 5.94658 26.9774 5.14685 26.2396C4.40864 25.5633 3.46537 24.5796 3.03474 24.0467C2.48109 23.3704 2.23502 22.858 2.23502 22.4071C2.23502 21.8128 2.68614 21.2799 6.50024 17.4884C9.78118 14.1888 10.868 13.2256 11.2576 13.2256C11.6472 13.2461 12.5905 14.0454 14.9487 16.4022C17.6349 19.0665 18.2296 19.5584 18.7422 19.5789Z'
														fill='#375DFB'
													/>
													<path
														d='M10.5605 0.643081C11.1142 0.458631 12.1395 0.233187 12.8162 0.130715C13.4929 0.00774801 14.8257 -0.0332346 15.7895 0.0282489C16.7533 0.0692378 18.0862 0.253698 18.7629 0.417653C19.4396 0.602104 20.5469 0.991487 21.2236 1.2989C21.9003 1.62682 22.9051 2.20067 23.4792 2.56957C24.0329 2.95897 24.8736 3.59429 25.3042 4.00418C25.7554 4.39358 26.5141 5.27484 27.0062 5.95116C27.4984 6.62747 27.9085 7.38578 27.888 7.63171C27.888 7.93913 27.3343 8.67693 26.3911 9.64017C25.5913 10.5009 24.7506 11.1772 24.5455 11.1772C24.3405 11.1772 23.8893 10.6854 23.4587 9.98857C23.0486 9.35325 22.4744 8.55396 22.1668 8.22605C21.8798 7.89814 21.08 7.2833 20.4033 6.83242C19.7267 6.40203 18.5783 5.84869 17.8401 5.62325C17.0404 5.37732 15.9331 5.23386 15.0718 5.23386C14.2721 5.23386 13.1648 5.35683 12.6111 5.52078C12.0369 5.66425 11.0937 6.03313 10.499 6.32005C9.92484 6.62747 9.00208 7.2628 8.46893 7.73418C7.95628 8.22605 7.23857 9.06633 6.86947 9.64017C6.52087 10.1935 6.04923 11.0748 5.86468 11.5871C5.65962 12.0995 5.41355 13.2882 5.14697 15.9935L3.34246 17.797C2.35818 18.7807 1.37389 19.58 1.16883 19.58C0.984282 19.58 0.738211 19.4161 0.635682 19.2111C0.533153 19.0267 0.3486 18.2683 0.225565 17.5305C0.102529 16.7927 0 15.6246 0 14.9073C0 14.2104 0.143541 12.9193 0.328094 12.038C0.512647 11.1773 0.881753 9.90659 1.16883 9.23027C1.45592 8.55396 2.07109 7.40627 2.56323 6.66847C3.03487 5.93066 4.08067 4.74198 4.85989 4.00418C5.70063 3.2049 6.95149 2.32365 7.91527 1.83178C8.79702 1.36041 9.98636 0.827532 10.5605 0.643081Z'
														fill='#00C8F4'
													/>
												</svg>
											</div>
											<div className="absolute backdrop-blur-[2.5px] backdrop-filter bg-[rgba(255,255,255,0.2)] bottom-0 left-0 right-0 rounded-bl-[8px] rounded-br-[8px] top-1/2" />
										</div>
										<div className="absolute inset-0 pointer-events-none shadow-[inset_0px_-0.5px_0.5px_0px_rgba(10,13,18,0.1)]" />
									</div>
								</div>
								<span className='text-lg font-semibold text-[#e9eaeb]'>NOGL</span>
							</div>
						</div>

						{/* Mobile Search */}
						<div className="px-4 pb-4">
							<SidebarSearch 
								placeholder="Search"
								onSearch={(query) => {
									// Handle search functionality
									console.log('Search query:', query);
								}}
							/>
						</div>

					{/* Mobile Navigation */}
					<div className="flex-1 overflow-y-auto px-4 py-4">
						<ErrorBoundary
							fallback={
								<div className="p-4 text-center">
									<div className="text-red-600 text-sm">
										Failed to load navigation. Please refresh the page.
									</div>
								</div>
							}
						>
							<Suspense fallback={<LoadingSpinner size="sm" className="p-4" />}>
								<SidebarNavigationSectionsSubheadings 
									activeUrl={pathname} 
									items={navItemsWithSectionsSubheadings} 
								/>
							</Suspense>
						</ErrorBoundary>
					</div>

						{/* Mobile Sidebar Footer */}
						<ErrorBoundary
							fallback={
								<div className="px-4 pb-4 text-center text-red-600 text-sm">
									Failed to load sidebar footer
								</div>
							}
						>
							<SidebarFooter 
								user={user}
								onLogout={handleLogout}
								isCollapsed={false}
								isHovered={false}
								theme={theme}
							/>
						</ErrorBoundary>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<main
				id="main-content"
				className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out ${
					isCollapsed && !isHovered ? "lg:ml-16" : "lg:ml-80"
				} ml-16 ${
					theme === 'dark' ? 'bg-[#0a0d12]' : 'bg-white'
				}`}
				role="main"
				aria-label="Main content"
			>

				{/* Page content */}
				<div className={`sidebar-scroll flex-1 overflow-y-auto ${
					theme === 'dark' ? 'bg-[#0a0d12]' : 'bg-white'
				}`}>
					{children}
				</div>
			</main>
		</div>
	);
};

export default SidebarLayout;
