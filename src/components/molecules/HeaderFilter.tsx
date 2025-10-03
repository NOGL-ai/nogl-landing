"use client";

import React, { FC, useEffect, useState, ReactNode } from "react";
import Heading from "@/shared/Heading";
import Nav from "@/shared/Nav";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

export interface HeaderFilterProps {
	tabActive: string;
	tabs: string[];
	heading: ReactNode;
	subHeading?: ReactNode;
	onClickTab?: (item: string) => void;
}

const HeaderFilter: FC<HeaderFilterProps> = ({
	tabActive,
	tabs,
	subHeading = "",
	heading = "Latest Articles 🎈",
	onClickTab = () => {},
}) => {
	const [tabActiveState, setTabActiveState] = useState(tabActive);

	useEffect(() => {
		setTabActiveState(tabActive);
	}, [tabActive]);

	const handleClickTab = (item: string) => {
		onClickTab(item);
		setTabActiveState(item);
	};

	return (
		<div className='relative mb-8 flex flex-col'>
			<Heading desc={subHeading}>{heading}</Heading>
			<div className='flex items-center justify-between'>
				<Nav
					className='sm:space-x-2'
					containerClassName='relative flex w-full overflow-x-auto text-sm md:text-base hiddenScrollbar'
				>
					{tabs.map((item, index) => (
						<Button
							key={index}
							onClick={() => handleClickTab(item)}
							variant={tabActiveState === item ? "default" : "ghost"}
							className={`m-1 min-w-fit border-0 transition-colors ${
								tabActiveState === item
									? "bg-black text-white hover:bg-neutral-800"
									: "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-black"
							}`}
						>
							{item}
						</Button>
					))}
				</Nav>
				<span className='hidden flex-shrink-0 sm:block'>
					<ButtonSecondary href='/listing-session' className='!leading-none'>
						<div className='flex items-center justify-center'>
							<span>View all</span>
							<ArrowRightIcon className='ml-3 h-5 w-5' />
						</div>
					</ButtonSecondary>
				</span>
			</div>
		</div>
	);
};

export default HeaderFilter;
