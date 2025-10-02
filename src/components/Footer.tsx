"use client";

import Logo from "@/shared/Logo";
import SocialsList1 from "@/shared/SocialsList1";
import { CustomLink } from "@/data/types";
import React from "react";

export interface WidgetFooterMenu {
	id: string;
	title: string;
	menus: CustomLink[];
}

const getWidgetMenus = (lang: string): WidgetFooterMenu[] => [
	{
		id: "1",
		title: "Product",
		menus: [
			{ href: "/about", label: "How it works" },
			{ href: "/#pricing", label: "Pricing" },
		],
	},
	{
		id: "2",
		title: "Company",
		menus: [
			{ href: "/about", label: "About" },
			{ href: "/blog", label: "Blog" },
			{ href: "/contact", label: "Contact" },
			{ href: "/support", label: "Support" },
		],
	},
	{
		id: "3",
		title: "Account",
		menus: [
			{ href: "/auth/signin", label: "Sign In" },
			{ href: "/auth/signup", label: "Sign Up" },
			{ href: "/user", label: "Dashboard" },
			{ href: "/user/billing", label: "Billing" },
		],
	},
	{
		id: "4",
		title: "Legal",
		menus: [
			{ href: lang === 'de' ? "/datenschutz" : "/privacy-policy", label: lang === 'de' ? "Datenschutzerklärung" : "Privacy Policy" },
			{ href: lang === 'de' ? "/agb" : "/tos", label: lang === 'de' ? "Allgemeine Geschäftsbedingungen" : "Terms of Service" },
			...(lang === 'de' ? [{ href: "/impressum", label: "Impressum" }] : []),
			{ href: "/support", label: "Help Center" },
		],
	},
];

const Footer: React.FC<{ lang?: string }> = ({ lang = 'en' }) => {
	const widgetMenus = getWidgetMenus(lang);
	
	const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
		return (
			<div key={index} className='text-sm'>
				<h2 className='font-semibold text-neutral-700 dark:text-neutral-200'>
					{menu.title}
				</h2>
				<ul className='mt-5 space-y-4'>
					{menu.menus.map((item, index) => (
						<li key={index}>
							<a
								key={index}
								className='text-neutral-6000 hover:text-black dark:text-neutral-300 dark:hover:text-white'
								href={item.href}
							>
								{item.label}
							</a>
						</li>
					))}
				</ul>
			</div>
		);
	};

	return (
		<>
			<div className='nc-Footer relative border-t border-neutral-200 py-24 dark:border-neutral-700 lg:py-28'>
				<div className='container grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10 '>
					<div className='col-span-2 grid grid-cols-4 gap-5 md:col-span-4 lg:md:col-span-1 lg:flex lg:flex-col'>
						<div className='col-span-2 md:col-span-1'>
							<Logo />
						</div>
						<div className='col-span-2 flex items-center md:col-span-3'>
							<SocialsList1 className='flex items-center space-x-3 lg:flex-col lg:items-start lg:space-x-0 lg:space-y-2.5' />
						</div>
					</div>
					{widgetMenus.map(renderWidgetMenuItem)}
				</div>
			</div>
		</>
	);
};

export default Footer;
