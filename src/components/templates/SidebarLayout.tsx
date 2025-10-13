"use client";

import React, { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSidebar } from "@/hooks/useSidebar";
import { UserProfile } from "@/types/navigation";
import { SidebarNavigationSectionsSubheadings } from "@/components/application/app-navigation/sidebar-navigation/sidebar-sections-subheadings";
import { SidebarFooter } from "@/components/application/app-navigation/sidebar-footer";
import { SidebarSearch } from "@/components/application/app-navigation/sidebar-search";
import CollapsedSidebar from "@/components/application/app-navigation/collapsed-sidebar";
import { MobileNavigation } from "@/components/application/app-navigation/mobile-navigation";
import { MobileHeader } from "@/components/application/app-navigation/mobile-header";
import { CopilotLayoutWrapper } from "@/components/application/slideout-menus";
import { navItemsWithSectionsSubheadings } from "@/data/navigationItems";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/base/error-boundary";
import { LoadingSpinner } from "@/components/base/loading-spinner";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { i18n } from "@/i18n";
import "@/styles/sidebar-animations.css";
import GlassBackground from "@/components/molecules/GlassBackground";
import ParticlesCanvas from "@/components/molecules/ParticlesCanvas";

interface SidebarLayoutProps {
	children: React.ReactNode;
	user?: UserProfile;
	onLogout?: () => void | Promise<void>;
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
	const [mounted, setMounted] = useState(true);
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

	const handleLogout = useCallback(async () => {
		try {
			if (onLogout) {
				await onLogout();
			}
		} catch (error) {
			console.error("Error during custom logout cleanup", error);
		}

		const segments = pathname.split("/").filter(Boolean);
		const candidateLocale = segments[0];
		const resolvedLocale = i18n.locales.includes(candidateLocale as (typeof i18n.locales)[number])
			? (candidateLocale as (typeof i18n.locales)[number])
			: i18n.defaultLocale;
		const callbackUrl = `/${resolvedLocale}/auth/signin`;

		await signOut({ callbackUrl });
	}, [onLogout, pathname]);

	const handleNavigation = useCallback((href: string) => {
		// Use Next.js router for navigation
		window.location.href = href;
	}, []);


	return (
		<div className={`relative isolate flex h-full min-h-0 w-full overflow-x-hidden ${className}`} onKeyDown={handleKeyDown}>
			{/* Skip to main content link for screen readers */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:text-secondary focus:rounded-md focus:shadow-lg"
			>
				Skip to main content
			</a>

			{/* Background layers */}
			<GlassBackground />
			<ParticlesCanvas />

			{/* Desktop Sidebar - Two-Level Navigation - Hidden on mobile */}
			<div className="hidden lg:block relative z-10">
				<CollapsedSidebar
					user={user}
					onLogout={handleLogout}
					onNavigate={handleNavigation}
				/>
			</div>

			{/* Mobile Header - Only visible on mobile */}
			<MobileHeader 
				onMenuClick={openMobile}
				isMenuOpen={isMobileOpen}
			/>

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
					<div className="absolute inset-0 bg-black/40 dark:bg-black/70" />
				</div>

				{/* Floating close button in overlay, aligned to panel edge */}
				<button
					className="fixed z-[60] lg:hidden rounded-lg p-2 text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-colors"
					onClick={(e) => { e.stopPropagation(); closeMobile(); }}
					aria-label="Close mobile navigation menu"
					style={{
						left: 'min(calc(100vw - 44px), calc(20rem + 12px))',
						top: 'calc(env(safe-area-inset-top, 0px) + 12px)'
					}}
				>
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="2"
						stroke="currentColor"
						aria-hidden="true"
						focusable="false"
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				
				{/* Mobile sidebar content */}
				<div 
					className={`fixed left-0 top-0 h-full w-80 bg-white border-r border-[#e9eaeb] dark:bg-[#0a0d12] dark:border-[#252b37] transform transition-transform duration-300 ease-in-out shadow-[0px_20px_24px_-4px_rgba(10,13,18,0.08),0px_8px_8px_-4px_rgba(10,13,18,0.03),0px_3px_3px_-1.5px_rgba(10,13,18,0.04)] ${
						isMobileOpen ? 'sidebar-slide-in' : 'sidebar-slide-out'
					}`}
					style={{
						transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)'
					}}
				>

					<div className="flex flex-col h-full pt-16">
						{/* Mobile Search */}
						<div className="px-4 pb-4">
							<SidebarSearch 
								placeholder="Search"
								onSearch={(query) => {
									console.log('Search query:', query);
								}}
							/>
						</div>

						{/* Mobile Navigation */}
						<div className="flex-1 overflow-y-auto px-2 py-2">
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
									<MobileNavigation
										activeUrl={pathname}
										onNavigate={handleNavigation}
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
							/>
						</ErrorBoundary>
					</div>
				</div>
			</div>

		{/* Main Content */}
		<main
			id="main-content"
			className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out lg:ml-[72px] pt-16 lg:pt-0 relative z-1"
			role="main"
			aria-label="Main content"
		>
			{/* Page content */}
			<div className="flex-1 overflow-y-auto lg:rounded-tl-[40px] bg-background/85">
				{children}
			</div>
		</main>

		{/* Floating AI Copilot Button - Only visible on mobile/tablet (< lg breakpoint) */}
		{/* COMMENTED OUT: Now using permanent AssistantSidebar in app layout instead of slideout modal */}
		{/* 
		<div className="lg:hidden">
			<CopilotLayoutWrapper 
				userName={user?.name}
				userAvatar={user?.avatar}
			/>
		</div>
		*/}
		</div>
	);
};

export default SidebarLayout;
