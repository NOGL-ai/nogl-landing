"use client";

import React, { useState } from "react";
import Image from "next/image";

interface Product {
	id: string;
	name: string;
	sku: string;
	image: string;
}

interface CompetitorPrices {
	cheapest: number;
	average: number;
	highest: number;
}

interface RepricingData {
	product: Product;
	currentPrice: number;
	cost: number;
	markup: {
		amount: number;
		percentage: number;
	};
	newPrice: {
		oldPrice: number;
		newPrice: number;
		changePercentage: number;
		canReprice: boolean;
	};
	minMaxPrice: {
		min: number | null;
		max: number | null;
	};
	competitorPrices: CompetitorPrices | null;
	triggeredRule: string;
	priceColor: "red" | "green" | "normal";
}

const mockData: RepricingData[] = [
	{
		product: {
			id: "1",
			name: "Blue Jeans",
			sku: "tshirt-test-demo1",
			image: "/api/placeholder/32/32",
		},
		currentPrice: 24.0,
		cost: 0.0,
		markup: { amount: 24.0, percentage: 100 },
		newPrice: {
			oldPrice: 63.98,
			newPrice: 13.98,
			changePercentage: -42,
			canReprice: true,
		},
		minMaxPrice: { min: null, max: null },
		competitorPrices: {
			cheapest: 13.98,
			average: 13.98,
			highest: 13.98,
		},
		triggeredRule: "test new price adjust",
		priceColor: "red",
	},
	{
		product: {
			id: "2",
			name: "Graphic print T-shirt",
			sku: "tshirt-test-demo1",
			image: "/api/placeholder/32/32",
		},
		currentPrice: 50.0,
		cost: 0.0,
		markup: { amount: 50.0, percentage: 100 },
		newPrice: {
			oldPrice: 63.98,
			newPrice: 13.98,
			changePercentage: -42,
			canReprice: true,
		},
		minMaxPrice: { min: null, max: null },
		competitorPrices: {
			cheapest: 13.98,
			average: 13.98,
			highest: 13.98,
		},
		triggeredRule: "test new price adjust",
		priceColor: "red",
	},
	{
		product: {
			id: "3",
			name: "Trousers",
			sku: "tshirt-test-demo1",
			image: "/api/placeholder/32/32",
		},
		currentPrice: 12.0,
		cost: 0.0,
		markup: { amount: 12.0, percentage: 100 },
		newPrice: {
			oldPrice: 63.98,
			newPrice: 13.98,
			changePercentage: 16.5,
			canReprice: true,
		},
		minMaxPrice: { min: null, max: null },
		competitorPrices: {
			cheapest: 13.98,
			average: 565.03,
			highest: 13.98,
		},
		triggeredRule: "test new price adjust",
		priceColor: "green",
	},
	{
		product: {
			id: "4",
			name: "Leather biker jacket",
			sku: "tshirt-test-demo1",
			image: "/api/placeholder/32/32",
		},
		currentPrice: 699.95,
		cost: 0.0,
		markup: { amount: 699.95, percentage: 100 },
		newPrice: {
			oldPrice: 63.98,
			newPrice: 13.98,
			changePercentage: -98,
			canReprice: true,
		},
		minMaxPrice: { min: null, max: null },
		competitorPrices: {
			cheapest: 13.98,
			average: 13.98,
			highest: 13.98,
		},
		triggeredRule: "test new price adjust",
		priceColor: "red",
	},
	{
		product: {
			id: "5",
			name: "Sporty bomber jacket",
			sku: "tshirt-test-demo1",
			image: "/api/placeholder/32/32",
		},
		currentPrice: 50.95,
		cost: 0.0,
		markup: { amount: 50.0, percentage: 100 },
		newPrice: {
			oldPrice: 0,
			newPrice: 0,
			changePercentage: 0,
			canReprice: false,
		},
		minMaxPrice: { min: null, max: null },
		competitorPrices: null,
		triggeredRule: "test new price adjust",
		priceColor: "normal",
	},
	{
		product: {
			id: "6",
			name: "Button-up shirt",
			sku: "tshirt-test-demo1",
			image: "/api/placeholder/32/32",
		},
		currentPrice: 20.95,
		cost: 0.0,
		markup: { amount: 20.0, percentage: 100 },
		newPrice: {
			oldPrice: 0,
			newPrice: 0,
			changePercentage: 0,
			canReprice: false,
		},
		minMaxPrice: { min: null, max: null },
		competitorPrices: null,
		triggeredRule: "test new price adjust",
		priceColor: "normal",
	},
	{
		product: {
			id: "7",
			name: "Polo shirt",
			sku: "tshirt-test-demo1",
			image: "/api/placeholder/32/32",
		},
		currentPrice: 20.95,
		cost: 0.0,
		markup: { amount: 20.0, percentage: 100 },
		newPrice: {
			oldPrice: 0,
			newPrice: 0,
			changePercentage: 0,
			canReprice: false,
		},
		minMaxPrice: { min: null, max: null },
		competitorPrices: null,
		triggeredRule: "test new price adjust",
		priceColor: "normal",
	},
	{
		product: {
			id: "8",
			name: "Polo shirt",
			sku: "tshirt-test-demo1",
			image: "/api/placeholder/32/32",
		},
		currentPrice: 20.95,
		cost: 0.0,
		markup: { amount: 20.0, percentage: 100 },
		newPrice: {
			oldPrice: 0,
			newPrice: 0,
			changePercentage: 0,
			canReprice: false,
		},
		minMaxPrice: { min: null, max: null },
		competitorPrices: null,
		triggeredRule: "test new price adjust",
		priceColor: "normal",
	},
];

const RepricingPreview: React.FC = () => {
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(57);

	const handleSelectAll = () => {
		if (selectedItems.size === mockData.length) {
			setSelectedItems(new Set());
		} else {
			setSelectedItems(new Set(mockData.map((item) => item.product.id)));
		}
	};

	const handleSelectItem = (id: string) => {
		const newSelected = new Set(selectedItems);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedItems(newSelected);
	};

	const CheckboxComponent = ({
		checked,
		onChange,
	}: {
		checked: boolean;
		onChange: () => void;
	}) => (
		<div className='relative'>
			<input
				type='checkbox'
				checked={checked}
				onChange={onChange}
				className='sr-only'
			/>
			<div
				className={`h-4 w-4 rounded border ${
					checked
						? "bg-primary-500 border-primary-500"
						: "border-[#DEE0E3] bg-white"
				} cursor-pointer shadow-sm`}
				onClick={onChange}
			>
				{checked && (
					<svg
						className='absolute left-0.5 top-0.5 h-3 w-3 text-white'
						fill='currentColor'
						viewBox='0 0 20 20'
					>
						<path
							fillRule='evenodd'
							d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
							clipRule='evenodd'
						/>
					</svg>
				)}
			</div>
		</div>
	);

	const SearchIcon = () => (
		<svg
			width='20'
			height='20'
			viewBox='0 0 20 20'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M9.25 2.5C12.976 2.5 16 5.524 16 9.25C16 12.976 12.976 16 9.25 16C5.524 16 2.5 12.976 2.5 9.25C2.5 5.524 5.524 2.5 9.25 2.5ZM9.25 14.5C12.1502 14.5 14.5 12.1502 14.5 9.25C14.5 6.349 12.1502 4 9.25 4C6.349 4 4 6.349 4 9.25C4 12.1502 6.349 14.5 9.25 14.5ZM15.6137 14.5532L17.7355 16.6742L16.6742 17.7355L14.5532 15.6137L15.6137 14.5532Z'
				fill='#868C98'
			/>
		</svg>
	);

	const FilterIcon = () => (
		<svg
			width='20'
			height='20'
			viewBox='0 0 20 20'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M8.5 14.5H11.5V13H8.5V14.5ZM3.25 5.5V7H16.75V5.5H3.25ZM5.5 10.75H14.5V9.25H5.5V10.75Z'
				fill='#54565B'
			/>
		</svg>
	);

	const ArrowDownIcon = () => (
		<svg
			width='20'
			height='20'
			viewBox='0 0 20 20'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M10.0001 10.879L13.7126 7.1665L14.7731 8.227L10.0001 13L5.22705 8.227L6.28755 7.1665L10.0001 10.879Z'
				fill='#525866'
			/>
		</svg>
	);

	const MoneyIcon = () => (
		<svg
			width='16'
			height='16'
			viewBox='0 0 16 16'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M8 14C4.6862 14 2 11.3138 2 8C2 4.6862 4.6862 2 8 2C11.3138 2 14 4.6862 14 8C14 11.3138 11.3138 14 8 14ZM8 12.8C9.27304 12.8 10.4939 12.2943 11.3941 11.3941C12.2943 10.4939 12.8 9.27304 12.8 8C12.8 6.72696 12.2943 5.50606 11.3941 4.60589C10.4939 3.70571 9.27304 3.2 8 3.2C6.72696 3.2 5.50606 3.70571 4.60589 4.60589C3.70571 5.50606 3.2 6.72696 3.2 8C3.2 9.27304 3.70571 10.4939 4.60589 11.3941C5.50606 12.2943 6.72696 12.8 8 12.8ZM5.9 9.2H9.2C9.27957 9.2 9.35587 9.16839 9.41213 9.11213C9.46839 9.05587 9.5 8.97957 9.5 8.9C9.5 8.82044 9.46839 8.74413 9.41213 8.68787C9.35587 8.63161 9.27957 8.6 9.2 8.6H6.8C6.40218 8.6 6.02064 8.44197 5.73934 8.16066C5.45804 7.87936 5.3 7.49783 5.3 7.1C5.3 6.70218 5.45804 6.32064 5.73934 6.03934C6.02064 5.75804 6.40218 5.6 6.8 5.6H7.4V4.4H8.6V5.6H10.1V6.8H6.8C6.72044 6.8 6.64413 6.83161 6.58787 6.88787C6.53161 6.94413 6.5 7.02044 6.5 7.1C6.5 7.17956 6.53161 7.25587 6.58787 7.31213C6.64413 7.36839 6.72044 7.4 6.8 7.4H9.2C9.59783 7.4 9.97936 7.55804 10.2607 7.83934C10.542 8.12064 10.7 8.50218 10.7 8.9C10.7 9.29782 10.542 9.67936 10.2607 9.96066C9.97936 10.242 9.59783 10.4 9.2 10.4H8.6V11.6H7.4V10.4H5.9V9.2Z'
				fill='#0E121B'
			/>
		</svg>
	);

	const ArrowLeftIcon = () => (
		<svg
			width='20'
			height='20'
			viewBox='0 0 20 20'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M6.5235 9.1664H16.6668V10.8331H6.5235L10.9935 15.3031L9.81516 16.4814L3.3335 9.99973L9.81516 3.51807L10.9935 4.6964L6.5235 9.1664Z'
				fill='#0F1324'
				fillOpacity='0.6'
			/>
		</svg>
	);

	const ArrowRightIcon = () => (
		<svg
			width='20'
			height='20'
			viewBox='0 0 20 20'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M13.4768 9.1664L9.00683 4.6964L10.1852 3.51807L16.6668 9.99973L10.1852 16.4814L9.00683 15.3031L13.4768 10.8331H3.3335V9.1664H13.4768Z'
				fill='#0F1324'
				fillOpacity='0.6'
			/>
		</svg>
	);

	const formatPrice = (price: number): string => {
		return `€ ${price.toFixed(2)}`;
	};

	const getPriceColor = (priceColor: "red" | "green" | "normal"): string => {
		switch (priceColor) {
			case "red":
				return "#F05252";
			case "green":
				return "#1FC16B";
			default:
				return "#0E121B";
		}
	};

	return (
		<div className='bg-gray-3 w-full p-6'>
			{/* Header */}
			<div className='mb-5'>
				<div className='mb-6 flex items-start gap-3 rounded-xl border border-[#F2F2F2] bg-white p-6'>
					<div className='flex-1'>
						<h1 className='text-text-main-900 mb-1 text-2xl font-bold leading-8 tracking-[-0.336px]'>
							Repricing Preview
						</h1>
						<p className='text-text-sub-500 text-sm leading-5 tracking-[-0.07px]'>
							See how the prices in your catalog would be repriced according to
							your repricing rules.
						</p>
					</div>
				</div>
			</div>

			{/* Table Container */}
			<div className='rounded-xl border border-[#DEE0E3] bg-white'>
				{/* Search and Actions Bar */}
				<div className='flex items-center justify-between border-b border-[#E9EAEC] p-3'>
					<div className='flex items-center gap-3'>
						<div className='relative'>
							<input
								type='text'
								placeholder='Search a campaign...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='focus:ring-primary-500 h-9 w-[308px] rounded-lg border border-[#E2E4E9] bg-white py-2 pl-10 pr-3 text-sm placeholder-[#868C98] shadow-sm focus:border-transparent focus:outline-none focus:ring-2'
							/>
							<div className='absolute left-2 top-1/2 -translate-y-1/2 transform'>
								<SearchIcon />
							</div>
						</div>
					</div>

					<div className='flex items-center gap-3'>
						<button className='flex h-9 items-center gap-2 rounded-lg border border-[#E2E4E9] bg-white px-3 py-2 shadow-sm transition-colors hover:bg-gray-50'>
							<FilterIcon />
							<span className='text-sm font-medium text-[#54565B]'>Filter</span>
						</button>

						<button className='flex h-9 items-center gap-2 rounded-lg border border-[#E2E4E9] bg-white px-3 py-2 shadow-sm transition-colors hover:bg-gray-50'>
							<span className='text-sm font-medium text-[#54565B]'>
								Massive Actions
							</span>
							<ArrowDownIcon />
						</button>
					</div>
				</div>

				{/* Table */}
				<div className='overflow-hidden'>
					<div className='flex'>
						{/* Product Name Column */}
						<div className='flex w-60 flex-col'>
							<div className='flex h-10 items-center gap-3 border-b border-[#E9EAEC] bg-[#F7F7F8] px-3'>
								<CheckboxComponent
									checked={selectedItems.size === mockData.length}
									onChange={handleSelectAll}
								/>
								<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#525866]'>
									Product Name
								</span>
							</div>
							{mockData.map((item) => (
								<div
									key={item.product.id}
									className='flex h-[88px] items-center gap-3 border-b border-[#E9EAEC] bg-white px-3'
								>
									<CheckboxComponent
										checked={selectedItems.has(item.product.id)}
										onChange={() => handleSelectItem(item.product.id)}
									/>
									<div className='flex flex-1 items-center gap-2'>
										<div className='h-8 w-8 overflow-hidden rounded-full bg-gray-200'>
											<Image
												src={item.product.image}
												alt={item.product.name}
												width={32}
												height={32}
												className='h-full w-full object-cover'
											/>
										</div>
										<div className='flex flex-1 flex-col gap-0.5'>
											<div className='text-xs font-medium leading-5 tracking-[-0.06px] text-[#0E121B]'>
												{item.product.name}
											</div>
											<div className='text-xs leading-4 text-[#525866]'>
												SKU: {item.product.sku}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Price Column */}
						<div className='flex w-[86px] flex-col'>
							<div className='flex h-10 items-center border-b border-[#E9EAEC] bg-[#F7F7F8] px-3'>
								<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#525866]'>
									Price
								</span>
							</div>
							{mockData.map((item) => (
								<div
									key={item.product.id}
									className='flex h-[88px] items-center border-b border-[#E9EAEC] bg-white px-3'
								>
									<span
										className='flex-1 text-xs font-normal leading-5 tracking-[-0.06px]'
										style={{ color: getPriceColor(item.priceColor) }}
									>
										{formatPrice(item.currentPrice)}
									</span>
								</div>
							))}
						</div>

						{/* Cost Column */}
						<div className='flex w-[86px] flex-col'>
							<div className='flex h-10 items-center border-b border-[#E9EAEC] bg-[#F7F7F8] px-3'>
								<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#525866]'>
									Cost
								</span>
							</div>
							{mockData.map((item) => (
								<div
									key={item.product.id}
									className='flex h-[88px] items-center border-b border-[#E9EAEC] bg-white px-3'
								>
									<span className='flex-1 text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
										{formatPrice(item.cost)}
									</span>
								</div>
							))}
						</div>

						{/* Markup Column */}
						<div className='flex w-[130px] flex-col'>
							<div className='flex h-10 items-center border-b border-[#E9EAEC] bg-[#F7F7F8] px-3'>
								<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#525866]'>
									Markup
								</span>
							</div>
							{mockData.map((item) => (
								<div
									key={item.product.id}
									className='flex h-[88px] items-center border-b border-[#E9EAEC] bg-white px-3'
								>
									<span className='flex-1 text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
										{formatPrice(item.markup.amount)} ({item.markup.percentage}
										%)
									</span>
								</div>
							))}
						</div>

						{/* New Price Column */}
						<div className='flex w-[180px] flex-col'>
							<div className='flex h-10 items-center border-b border-[#E9EAEC] bg-[#F7F7F8] px-3'>
								<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#525866]'>
									New Price
								</span>
							</div>
							{mockData.map((item) => (
								<div
									key={item.product.id}
									className='flex h-[88px] flex-col justify-center gap-0.5 border-b border-[#E9EAEC] bg-white px-3'
								>
									{item.newPrice.canReprice ? (
										<>
											<div className='flex items-center gap-1'>
												<span className='text-xs leading-5 tracking-[-0.06px] text-[#6C6E79] line-through'>
													{formatPrice(item.newPrice.oldPrice)}
												</span>
												<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													{formatPrice(item.newPrice.newPrice)}
												</span>
												<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													({item.newPrice.changePercentage > 0 ? "+" : ""}
													{item.newPrice.changePercentage}%)
												</span>
											</div>
											<button className='text-left text-xs font-normal leading-5 tracking-[-0.06px] text-[#375DFB] hover:underline'>
												Reprice Now
											</button>
										</>
									) : (
										<span className='text-xs leading-5 tracking-[-0.06px] text-[#6C6E79] line-through'>
											-
										</span>
									)}
								</div>
							))}
						</div>

						{/* Min/Max Price Column */}
						<div className='flex w-[152px] flex-col'>
							<div className='flex h-10 items-center border-b border-[#E9EAEC] bg-[#F7F7F8] px-3'>
								<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#525866]'>
									Min/Max Price
								</span>
							</div>
							{mockData.map((item) => (
								<div
									key={item.product.id}
									className='flex h-[88px] flex-col justify-center gap-0.5 border-b border-[#E9EAEC] bg-white px-3'
								>
									<div className='flex items-center justify-between'>
										<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
											Min Price:
										</span>
										<span className='text-right text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
											{item.minMaxPrice.min
												? formatPrice(item.minMaxPrice.min)
												: "-"}
										</span>
									</div>
									<div className='flex items-center justify-between'>
										<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
											Max Price:
										</span>
										<span className='text-right text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
											{item.minMaxPrice.max
												? formatPrice(item.minMaxPrice.max)
												: "-"}
										</span>
									</div>
								</div>
							))}
						</div>

						{/* Competitors Prices Column */}
						<div className='flex w-[212px] flex-col'>
							<div className='flex h-10 items-center border-b border-[#E9EAEC] bg-[#F7F7F8] px-3'>
								<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#525866]'>
									Competitors Prices
								</span>
							</div>
							{mockData.map((item) => (
								<div
									key={item.product.id}
									className='flex h-[88px] flex-col justify-center gap-0.5 border-b border-[#E9EAEC] bg-white px-3'
								>
									{item.competitorPrices ? (
										<>
											<div className='flex items-center justify-between'>
												<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													Cheapest Price:
												</span>
												<span className='w-14 text-right text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E9F6E]'>
													{formatPrice(item.competitorPrices.cheapest)}
												</span>
											</div>
											<div className='flex items-center justify-between'>
												<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													Avg Price:
												</span>
												<span className='w-14 text-right text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													{formatPrice(item.competitorPrices.average)}
												</span>
											</div>
											<div className='flex items-center justify-between'>
												<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													Highest Price:
												</span>
												<span className='w-14 text-right text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													{formatPrice(item.competitorPrices.highest)}
												</span>
											</div>
										</>
									) : (
										<>
											<div className='flex items-center justify-between'>
												<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													Cheapest Price:
												</span>
												<span className='w-14 text-right text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													-
												</span>
											</div>
											<div className='flex items-center justify-between'>
												<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													Avg Price:
												</span>
												<span className='w-14 text-right text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													-
												</span>
											</div>
											<div className='flex items-center justify-between'>
												<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													Highest Price:
												</span>
												<span className='w-14 text-right text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
													-
												</span>
											</div>
										</>
									)}
								</div>
							))}
						</div>

						{/* Triggered Rule Column */}
						<div className='flex w-[182px] flex-col'>
							<div className='flex h-10 items-center border-b border-[#E9EAEC] bg-[#F7F7F8] px-3'>
								<span className='text-xs font-normal leading-5 tracking-[-0.06px] text-[#525866]'>
									Triggered Rule
								</span>
							</div>
							{mockData.map((item) => (
								<div
									key={item.product.id}
									className='flex h-[88px] items-center gap-2 border-b border-[#E9EAEC] bg-white px-3'
								>
									<MoneyIcon />
									<span className='flex-1 text-xs font-normal leading-5 tracking-[-0.06px] text-[#0E121B]'>
										{item.triggeredRule}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Pagination */}
				<div className='flex items-center justify-center gap-2 px-6 py-5'>
					<button className='flex h-10 w-10 items-center justify-center rounded-xl bg-transparent transition-colors hover:bg-gray-50'>
						<ArrowLeftIcon />
					</button>

					<button className='flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium text-[#0F1324] opacity-60'>
						1
					</button>

					<button className='flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium text-[#0F1324] opacity-60'>
						...
					</button>

					<button className='flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium text-[#0F1324] opacity-60'>
						56
					</button>

					<button className='flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-medium text-[#14151A] shadow-sm'>
						57
					</button>

					<button className='flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium text-[#0F1324] opacity-60'>
						58
					</button>

					<button className='flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium text-[#0F1324] opacity-60'>
						...
					</button>

					<button className='flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium text-[#0F1324] opacity-60'>
						100
					</button>

					<button className='flex h-10 w-10 items-center justify-center rounded-xl bg-transparent transition-colors hover:bg-gray-50'>
						<ArrowRightIcon />
					</button>
				</div>
			</div>
		</div>
	);
};

export default RepricingPreview;
