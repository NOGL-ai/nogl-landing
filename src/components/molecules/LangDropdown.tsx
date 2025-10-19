import { Popover, Tab, Transition } from "@headlessui/react";
import {
	BanknotesIcon,
	GlobeAltIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { FC, Fragment } from "react";
import { headerCurrency } from "./CurrencyDropdown";
import { usePathname, useRouter } from "next/navigation";
// import { i18n } from "@/i18n";

export const headerLanguage = [
	{
		id: "en",
		name: "English",
		description: "United States",
		href: "##",
	},
	{
		id: "de",
		name: "Deutsch",
		description: "Germany",
		href: "##",
	},
];

interface LangDropdownProps {
	panelClassName?: string;
	className?: string;
}

function classNames(...classes: unknown) {
	return classes.filter(Boolean).join(" ");
}

const LangDropdown: FC<LangDropdownProps> = ({
	panelClassName = "top-full right-0 max-w-sm w-96",
	className = "hidden md:flex",
}) => {
	const pathname = usePathname();
	const router = useRouter();

	const switchLanguage = (locale: string) => {
		if (!pathname) return;
		const segments = pathname.split("/");
		segments[1] = locale;
		router.push(segments.join("/") as any);
	};

	const renderLang = (close: () => void) => {
		return (
			<div className='grid gap-8 lg:grid-cols-2'>
				{headerLanguage.map((item) => (
					<button
						key={item.id}
						onClick={() => {
							switchLanguage(item.id);
							close();
						}}
						className={`-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-secondary_bg focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 ${
							pathname?.startsWith(`/${item.id}`)
								? "bg-secondary_bg"
								: "opacity-80"
						}`}
					>
						<div className=''>
							<p className='text-sm font-medium '>{item.name}</p>
							<p className='text-xs text-tertiary dark:text-tertiary'>
								{item.description}
							</p>
						</div>
					</button>
				))}
			</div>
		);
	};

	const renderCurr = (close: () => void) => {
		return (
			<div className='grid gap-7 lg:grid-cols-2'>
				{headerCurrency.map((item, index) => (
					<a
						key={index}
						href={item.href}
						onClick={() => close()}
						className={`-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-secondary_bg focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 ${
							item.active ? "bg-secondary_bg" : "opacity-80"
						}`}
					>
						<item.icon className='h-[18px] w-[18px] ' />
						<p className='ml-2 text-sm font-medium '>{item.name}</p>
					</a>
				))}
			</div>
		);
	};

	return (
		<>
			<Popover className={`LangDropdown relative ${className}`}>
				{({ open, close }) => (
					<>
						<Popover.Button
							className={`
                ${open ? "" : "text-opacity-80"}
             group inline-flex h-10 items-center self-center px-3 py-1.5 text-sm font-medium text-secondary hover:text-opacity-100 focus:outline-none sm:h-12 dark:text-neutral-200 `}
						>
							<GlobeAltIcon className='h-5 w-5 opacity-80' />
							<span className='mx-1'>/</span>
							<BanknotesIcon className='h-5 w-5 opacity-80' />
							<ChevronDownIcon
								className={`${open ? "-rotate-180" : "text-opacity-70"}
                  ml-1 h-4 w-4  transition duration-150 ease-in-out group-hover:text-opacity-80`}
								aria-hidden='true'
							/>
						</Popover.Button>
						<Transition
							as={Fragment}
							enter='transition ease-out duration-200'
							enterFrom='opacity-0 translate-y-1'
							enterTo='opacity-100 translate-y-0'
							leave='transition ease-in duration-150'
							leaveFrom='opacity-100 translate-y-0'
							leaveTo='opacity-0 translate-y-1'
						>
							<Popover.Panel className={`absolute z-20  ${panelClassName}`}>
								<div className='rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black ring-opacity-5 sm:p-6 dark:bg-neutral-800'>
									<Tab.Group>
										<Tab.List className='flex space-x-1 rounded-full bg-secondary_bg p-1 dark:bg-slate-700'>
											{["Language", "Currency"].map((category) => (
												<Tab
													key={category}
													className={({ selected }) =>
														classNames(
															"w-full rounded-full py-2 text-sm font-medium leading-5 text-secondary",
															"focus:outline-none focus:ring-0",
															selected
																? "bg-white shadow"
																: "text-secondary hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-900/40"
														)
													}
												>
													{category}
												</Tab>
											))}
										</Tab.List>
										<Tab.Panels className='mt-5'>
											<Tab.Panel
												className={classNames(
													"rounded-xl p-3",
													"focus:outline-none focus:ring-0"
												)}
											>
												{renderLang(close)}
											</Tab.Panel>
											<Tab.Panel
												className={classNames(
													"rounded-xl p-3",
													"focus:outline-none focus:ring-0"
												)}
											>
												{renderCurr(close)}
											</Tab.Panel>
										</Tab.Panels>
									</Tab.Group>
								</div>
							</Popover.Panel>
						</Transition>
					</>
				)}
			</Popover>
		</>
	);
};
export default LangDropdown;
