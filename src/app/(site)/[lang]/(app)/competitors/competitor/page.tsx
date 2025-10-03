"use client";

import React, { useState } from "react";
import {
	MagnifyingGlassIcon,
	FunnelIcon,
	ChevronDownIcon,
	PlusIcon,
	XMarkIcon,
	InformationCircleIcon,
	EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import AddCompetitorModal from "@/components/molecules/AddCompetitorModal";

// This would normally be fetched from an API
const competitorsData = [
	{
		id: 1,
		selected: false,
		domain: {
			name: "Amazon (DE)",
			logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=40&h=40&fit=crop&auto=format",
		},
		monitoredUrls: 0,
		competitorDiscovery: 0,
		pricePosition: {
			lower: 0,
			equal: 0,
			higher: 0,
		},
		alerts: 1,
		status: "Active",
	},
	{
		id: 2,
		selected: false,
		domain: {
			name: "Google Shopping (DE)",
			logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=40&h=40&fit=crop&auto=format",
		},
		monitoredUrls: 0,
		competitorDiscovery: 0,
		pricePosition: {
			lower: 0,
			equal: 0,
			higher: 0,
		},
		alerts: 1,
		status: "Active",
	},
	{
		id: 3,
		selected: false,
		domain: {
			name: "Purelei.com",
			logo: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=40&h=40&fit=crop&auto=format",
		},
		monitoredUrls: 0,
		competitorDiscovery: 0,
		pricePosition: {
			lower: 0,
			equal: 0,
			higher: 0,
		},
		alerts: 1,
		status: "Active",
	},
];

interface CircularProgressProps {
	value: number;
	max: number;
	color: string;
	className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
	value,
	max,
	color,
	className = "",
}) => {
	const radius = 16;
	const circumference = 2 * Math.PI * radius;
	const strokeDasharray = `${circumference} ${circumference}`;
	const strokeDashoffset = circumference - (value / max) * circumference;

	return (
		<div className={`relative ${className}`}>
			<svg className='h-10 w-10 -rotate-90 transform' viewBox='0 0 40 40'>
				<circle
					cx='20'
					cy='20'
					r={radius}
					stroke='#C3DDFD'
					strokeWidth='5'
					fill='none'
				/>
				<circle
					cx='20'
					cy='20'
					r={radius}
					stroke={color}
					strokeWidth='5'
					fill='none'
					strokeDasharray={strokeDasharray}
					strokeDashoffset={strokeDashoffset}
					className='transition-all duration-300'
				/>
			</svg>
			<div className='absolute inset-0 flex items-center justify-center'>
				<span className='text-xs font-normal' style={{ color }}>
					{value}
				</span>
			</div>
		</div>
	);
};

interface StatusBadgeProps {
	status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
	return (
		<div className='inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-1'>
			<div className='mr-1.5 h-2 w-2 rounded-full bg-green-500'></div>
			<span className='text-xs font-medium text-green-700'>{status}</span>
		</div>
	);
};

interface ChannelBadgeProps {
	channel: string;
}

const ChannelBadge: React.FC<ChannelBadgeProps> = ({ channel }) => {
	const styles =
		channel === "Marketplace"
			? {
					bg: "bg-blue-50",
					border: "border-blue-200",
					dot: "bg-blue-500",
					text: "text-blue-700",
				}
			: channel === "Shopping"
				? {
						bg: "bg-purple-50",
						border: "border-purple-200",
						dot: "bg-purple-500",
						text: "text-purple-700",
					}
				: {
						bg: "bg-gray-50",
						border: "border-gray-200",
						dot: "bg-gray-500",
						text: "text-gray-700",
					};
	return (
		<div
			className={`inline-flex items-center rounded-full px-2.5 py-1 ${styles.bg} border ${styles.border}`}
		>
			<div className={`mr-1.5 h-2 w-2 rounded-full ${styles.dot}`}></div>
			<span className={`text-xs font-medium ${styles.text}`}>{channel}</span>
		</div>
	);
};

const getChannel = (name: string): string => {
	const n = name.toLowerCase();
	if (n.includes("amazon")) return "Marketplace";
	if (n.includes("google shopping")) return "Shopping";
	return "E-commerce";
};

export default function CompetitorsPage() {
	const [competitors, setCompetitors] = useState(competitorsData);
	const [searchTerm, setSearchTerm] = useState("");
	const [showBanner, setShowBanner] = useState(true);
	const [selectAll, setSelectAll] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);

	const handleSelectAll = () => {
		const newSelectAll = !selectAll;
		setSelectAll(newSelectAll);
		setCompetitors(
			competitors.map((competitor) => ({
				...competitor,
				selected: newSelectAll,
			}))
		);
	};

	const handleSelectCompetitor = (id: number) => {
		setCompetitors(
			competitors.map((competitor) =>
				competitor.id === id
					? { ...competitor, selected: !competitor.selected }
					: competitor
			)
		);
	};

	const handleMarketplaceClick = () => {
		setShowAddModal(false);
		// TODO: Add marketplace-specific logic here

	};

	const handleEcommerceClick = () => {
		setShowAddModal(false);
		// TODO: Add ecommerce-specific logic here

	};

	return (
		<div className='mx-auto flex w-full max-w-[1200px] flex-col items-center gap-5'>
			{/* Information Banner */}
			{showBanner && (
				<div className='w-full'>
					<div className='flex items-center justify-between rounded-md bg-gray-100 px-4 py-2'>
						<div className='flex items-center gap-3'>
							<InformationCircleIcon className='h-5 w-5 flex-shrink-0 text-blue-600' />
							<span className='text-sm font-normal text-blue-600'>
								Unconfirmed matches, older than 30 days, have been archived. In
								case you need them please contact our online support.
							</span>
						</div>
						<button
							onClick={() => setShowBanner(false)}
							className='rounded-md p-1 transition-colors hover:bg-gray-200'
						>
							<XMarkIcon className='h-5 w-5 text-gray-500' />
						</button>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className='flex w-full max-w-[1168px] flex-col gap-4'>
				{/* Header Section */}
				<div className='flex flex-col gap-4'>
					{/* Title and Controls */}
					<div className='flex items-start justify-between'>
						<div className='flex flex-col'>
							<h1 className='text-lg font-normal leading-7 text-gray-900'>
								Competitors
							</h1>
						</div>

						<div className='flex items-center gap-3'>
							{/* Search Input */}
							<div className='relative'>
								<div className='pointer-events-none absolute inset-y-0 left-3 flex items-center'>
									<MagnifyingGlassIcon className='h-4 w-4 text-gray-500' />
								</div>
								<input
									type='text'
									placeholder='Search'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className='w-[576px] rounded-md border border-gray-300 py-2 pl-10 pr-3 text-xs text-gray-600 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
								/>
							</div>

							{/* Filters Button */}
							<button className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50'>
								<FunnelIcon className='h-5 w-5 text-gray-500' />
								<span className='text-xs font-medium text-gray-700'>
									Filters
								</span>
							</button>

							{/* Massive Actions Dropdown */}
							<button className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50'>
								<span className='text-xs font-medium text-gray-700'>
									Massive Actions
								</span>
								<ChevronDownIcon className='h-5 w-5 text-gray-700' />
							</button>

							{/* Add Competitor Button */}
							<button
								onClick={() => setShowAddModal(true)}
								className='flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'
							>
								<PlusIcon className='h-4 w-4' />
								<span className='text-xs font-medium'>Add Competitor</span>
							</button>
						</div>
					</div>

					{/* Description */}
					<div>
						<p className='text-sm font-normal leading-5 text-gray-600'>
							Add and manage your competitors
						</p>
					</div>
				</div>

				{/* Table Section */}
				<div className='border-t border-gray-200 pt-4'>
					<div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
						{/* Table Header */}
						<div className='flex border-b border-gray-200 bg-gray-50'>
							<div className='flex w-9 items-center px-1 py-3'>
								<input
									type='checkbox'
									checked={selectAll}
									onChange={handleSelectAll}
									className='h-4 w-4 rounded border border-gray-300 bg-white'
								/>
							</div>
							<div className='w-[200px] px-1 py-3'>
								<span className='text-xs font-normal text-gray-600'>
									Competitor Domain
								</span>
							</div>
							<div className='w-[114px] px-1 py-3'>
								<span className='text-xs font-normal text-gray-600'>
									Monitored URLs
								</span>
							</div>
							<div className='w-[165px] px-1 py-3'>
								<span className='text-xs font-normal text-gray-600'>
									Competitor Discovery
								</span>
							</div>
							<div className='w-[140px] px-1 py-3'>
								<span className='text-xs font-normal text-gray-600'>
									Channel
								</span>
							</div>
							<div className='w-[237px] px-1 py-3'>
								<span className='text-xs font-normal text-gray-600'>
									Price Position
								</span>
							</div>
							<div className='w-[81px] px-1 py-3'>
								<span className='text-xs font-normal text-gray-600'>
									Alerts
								</span>
							</div>
							<div className='w-[115px] px-1 py-3'>
								<span className='text-xs font-normal text-gray-600'>
									Status
								</span>
							</div>
							<div className='w-[110px] px-1 py-3'>
								<span className='text-xs font-normal text-gray-600'>
									Compare
								</span>
							</div>
							<div className='w-[79px] px-1 py-3 text-center'>
								<span className='text-xs font-normal text-gray-600'>
									Actions
								</span>
							</div>
						</div>

						{/* Table Body */}
						<div className='bg-white'>
							{competitors.map((competitor, _index) => (
								<div
									key={competitor.id}
									className='flex items-center border-b border-gray-100 last:border-b-0'
								>
									{/* Checkbox */}
									<div className='flex w-9 items-center px-1 py-4'>
										<input
											type='checkbox'
											checked={competitor.selected}
											onChange={() => handleSelectCompetitor(competitor.id)}
											className='h-4 w-4 rounded border border-gray-300 bg-white'
										/>
									</div>

									{/* Domain */}
									<div className='w-[200px] px-1 py-4'>
										<div className='flex items-center gap-3'>
											<img
												src={competitor.domain.logo}
												alt={competitor.domain.name}
												className='h-10 w-10 rounded-full object-cover'
											/>
											<span className='text-xs font-normal text-gray-600'>
												{competitor.domain.name}
											</span>
										</div>
									</div>

									{/* Monitored URLs */}
									<div className='w-[114px] px-1 py-4'>
										<div className='flex items-center gap-3'>
											<CircularProgress
												value={competitor.monitoredUrls}
												max={100}
												color='#3F83F8'
											/>
											<button className='text-xs font-normal text-gray-600 hover:text-blue-600'>
												Show
											</button>
										</div>
									</div>

									{/* Competitor Discovery */}
									<div className='w-[165px] px-1 py-4'>
										<div className='flex items-center gap-3'>
											<div className='relative h-10 w-10'>
												<div className='flex h-10 w-10 items-center justify-center rounded-full border-4 border-purple-300'>
													<span className='text-xs font-normal text-purple-600'>
														{competitor.competitorDiscovery}
													</span>
												</div>
											</div>
											<button className='text-xs font-medium text-blue-600 underline hover:no-underline'>
												Show
											</button>
										</div>
									</div>

									{/* Channel */}
									<div className='w-[140px] px-1 py-4'>
										<ChannelBadge
											channel={getChannel(competitor.domain.name)}
										/>
									</div>

									{/* Price Position */}
									<div className='w-[237px] px-1 py-4'>
										<div className='flex flex-col gap-1'>
											<div className='text-xs font-normal text-gray-600'>
												{competitor.pricePosition.lower} Lower /{" "}
												{competitor.pricePosition.equal} Equal /{" "}
												{competitor.pricePosition.higher} Higher
											</div>
											<div className='h-2.5 w-44 rounded bg-gray-200'></div>
										</div>
									</div>

									{/* Alerts */}
									<div className='w-[81px] px-1 py-4'>
										<span className='text-xs font-normal text-gray-600'>
											{competitor.alerts} Alerts
										</span>
									</div>

									{/* Status */}
									<div className='w-[115px] px-1 py-4'>
										<StatusBadge status={competitor.status} />
									</div>

									{/* Compare */}
									<div className='flex w-[110px] items-center px-1 py-4'>
										{/* Derive a compare percentage from available data if present */}
										{(() => {
											const total =
												competitor.pricePosition.lower +
												competitor.pricePosition.equal +
												competitor.pricePosition.higher;
											const derived =
												total > 0
													? Math.round(
															(competitor.pricePosition.equal / total) * 100
														)
													: undefined;
											const percentage = Number.isFinite(derived)
												? (derived ?? 0)
												: typeof (competitor as any).compare === "number"
													? Math.max(
															0,
															Math.min(100, (competitor as any).compare)
														)
													: 0;
											return (
												<CircularProgress
													value={percentage}
													max={100}
													color='#3F83F8'
												/>
											);
										})()}
									</div>

									{/* Actions */}
									<div className='flex w-[79px] justify-center px-1 py-4'>
										<button className='rounded-md p-3 transition-colors hover:bg-gray-100'>
											<EllipsisHorizontalIcon className='h-4 w-4 text-gray-500' />
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Add Competitor Modal */}
			<AddCompetitorModal
				showModal={showAddModal}
				setShowModal={setShowAddModal}
				onMarketplaceClick={handleMarketplaceClick}
				onEcommerceClick={handleEcommerceClick}
			/>
		</div>
	);
}
