import { Tab } from "@headlessui/react";
import React, { Fragment, ReactNode } from "react";

export interface TabItemType {
	name: string;
	shortName?: string;
	count?: number;
	disabled?: boolean;
	content?: ReactNode;
}

interface TabGroupProps {
	tabs: TabItemType[];
	className?: string;
	variant?: "default" | "pills" | "underline";
	onChange?: (index: number) => void;
	sticky?: boolean;
}

const TabGroup: React.FC<TabGroupProps> = ({
	tabs,
	className = "",
	variant = "default",
	onChange,
	sticky = false,
}) => {
	return (
		<Tab.Group onChange={onChange}>
			<div
				className={`${sticky ? "sticky top-[80px] z-10 bg-white dark:bg-neutral-900" : ""}`}
			>
				<Tab.List className='flex space-x-1 rounded-xl bg-neutral-100/70 p-1 backdrop-blur-sm dark:bg-neutral-800/70'>
					{tabs.map((tab) => (
						<Tab
							key={tab.name}
							disabled={tab.disabled}
							className={({ selected, disabled }) => `
                flex w-full items-center justify-center 
                space-x-2 rounded-lg py-2.5 text-sm font-medium
                transition-all duration-150 ease-in-out
                ${
									disabled
										? "cursor-not-allowed text-neutral-400 opacity-50 dark:text-neutral-600"
										: selected
											? "bg-white text-neutral-900 shadow dark:bg-neutral-900 dark:text-white"
											: "text-neutral-600 hover:bg-white/[0.12] hover:text-neutral-900 dark:text-neutral-400"
								}
              `}
						>
							<span className='block md:hidden'>
								{tab.shortName || tab.name}
							</span>
							<span className='hidden md:block'>{tab.name}</span>
							{tab.count !== undefined && (
								<span className='text-xs'>({tab.count})</span>
							)}
						</Tab>
					))}
				</Tab.List>
			</div>

			<Tab.Panels className='mt-6'>
				{tabs.map((tab, idx) => (
					<Tab.Panel key={idx}>{tab.content}</Tab.Panel>
				))}
			</Tab.Panels>
		</Tab.Group>
	);
};

export default TabGroup;
