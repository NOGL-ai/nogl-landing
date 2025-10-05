"use client";

import React, { useState } from "react";
import { HelpCircle, ArrowDown, Trash01, Edit01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

const teamMembers = [
	{
		id: 1,
		name: "Olivia Rhye",
		username: "@olivia",
		avatar: "https://i.pravatar.cc/150?img=1",
		status: "Active",
		role: "Product Designer",
		email: "olivia@untitledui.com",
		teams: ["Design", "Product", "Marketing", "+4"],
	},
	{
		id: 2,
		name: "Phoenix Baker",
		username: "@phoenix",
		avatar: "https://i.pravatar.cc/150?img=2",
		status: "Active",
		role: "Product Manager",
		email: "phoenix@untitledui.com",
		teams: ["Design", "Product", "Marketing", "+4"],
	},
	{
		id: 3,
		name: "Lana Steiner",
		username: "@lana",
		avatar: "https://i.pravatar.cc/150?img=3",
		status: "Active",
		role: "Frontend Developer",
		email: "lana@untitledui.com",
		teams: ["Design", "Product", "Marketing", "+4"],
	},
	{
		id: 4,
		name: "Demi Wilkinson",
		username: "@demi",
		avatar: "https://i.pravatar.cc/150?img=4",
		status: "Active",
		role: "Backend Developer",
		email: "demi@untitledui.com",
		teams: ["Design", "Product", "Marketing", "+4"],
	},
	{
		id: 5,
		name: "Candice Wu",
		username: "@candice",
		initials: "CW",
		status: "Active",
		role: "Fullstack Developer",
		email: "candice@untitledui.com",
		teams: ["Design", "Product", "Marketing", "+4"],
	},
	{
		id: 6,
		name: "Natali Craig",
		username: "@natali",
		avatar: "https://i.pravatar.cc/150?img=6",
		status: "Active",
		role: "UX Designer",
		email: "natali@untitledui.com",
		teams: ["Design", "Product", "Marketing", "+4"],
	},
	{
		id: 7,
		name: "Drew Cano",
		username: "@drew",
		avatar: "https://i.pravatar.cc/150?img=7",
		status: "Active",
		role: "UX Copywriter",
		email: "drew@untitledui.com",
		teams: ["Design", "Product", "Marketing", "+4"],
	},
	{
		id: 8,
		name: "Orlando Diggs",
		username: "@orlando",
		initials: "OD",
		status: "Active",
		role: "UI Designer",
		email: "orlando@untitledui.com",
		teams: ["Design", "Product", "Marketing", "+4"],
	},
	{
		id: 9,
		name: "Andi Lane",
		username: "@andi",
		avatar: "https://i.pravatar.cc/150?img=9",
		status: "Active",
		role: "Product Manager",
		email: "andi@untitledui.com",
		teams: ["Design", "Product", "Marketing", "+4"],
	},
	{
		id: 10,
		name: "Kate Morrison",
		username: "@kate",
		avatar: "https://i.pravatar.cc/150?img=10",
		status: "Active",
		role: "QA Engineer",
		email: "kate@untitledui.com",
		teams: ["Design", "Product", "Marketing", "+4"],
	},
];

const teamBadgeColors = {
	Design: { bg: "#F9F5FF", border: "#E9D7FE", text: "#6941C6" },
	Product: { bg: "#EFF8FF", border: "#B2DDFF", text: "#175CD3" },
	Marketing: { bg: "#EEF4FF", border: "#C7D7FE", text: "#3538CD" },
	"+4": { bg: "#FAFAFA", border: "#E9EAEB", text: "#414651" },
};

export default function TestTableUntitledPage() {
	const [currentPage, setCurrentPage] = useState(1);
	const totalPages = 10;

	const getPaginationItems = () => {
		const items: (number | "ellipsis")[] = [];
		
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) {
				items.push(i);
			}
		} else {
			items.push(1, 2, 3, "ellipsis", 8, 9, 10);
		}
		
		return items;
	};

	return (
		<div className="container mx-auto px-4 py-4 sm:px-6 sm:py-8">
			{/* Card Container */}
			<div className="mx-auto flex w-full max-w-[1216px] flex-col rounded-xl border border-[#E9EAEB] bg-white shadow-[0_1px_2px_0_rgba(10,13,18,0.05)]">
				{/* Card Header */}
				<div className="flex flex-col gap-5 bg-white">
					<div className="flex items-start gap-4 px-4 pb-0 pt-5 sm:px-6">
						<div className="flex flex-1 flex-col justify-center gap-0.5">
							<div className="flex flex-wrap items-center gap-2">
								<h1 className="font-inter text-base font-semibold leading-6 text-[#181D27] sm:text-lg sm:leading-7">
									Team members
								</h1>
								<span className="inline-flex items-center rounded-2xl border border-[#E9D7FE] bg-[#F9F5FF] px-2 py-0.5 text-xs font-normal leading-[18px] text-[#6941C6]">
									100 users
								</span>
							</div>
						</div>
						<button className="flex flex-col items-start rounded-lg p-1 transition-colors hover:bg-gray-50">
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
							>
								<path
									d="M10.0003 10.8333C10.4606 10.8333 10.8337 10.4602 10.8337 9.99998C10.8337 9.53974 10.4606 9.16665 10.0003 9.16665C9.54009 9.16665 9.16699 9.53974 9.16699 9.99998C9.16699 10.4602 9.54009 10.8333 10.0003 10.8333Z"
									stroke="#A4A7AE"
									strokeWidth="1.66667"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M10.0003 4.99998C10.4606 4.99998 10.8337 4.62688 10.8337 4.16665C10.8337 3.70641 10.4606 3.33331 10.0003 3.33331C9.54009 3.33331 9.16699 3.70641 9.16699 4.16665C9.16699 4.62688 9.54009 4.99998 10.0003 4.99998Z"
									stroke="#A4A7AE"
									strokeWidth="1.66667"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M10.0003 16.6666C10.4606 16.6666 10.8337 16.2935 10.8337 15.8333C10.8337 15.3731 10.4606 15 10.0003 15C9.54009 15 9.16699 15.3731 9.16699 15.8333C9.16699 16.2935 9.54009 16.6666 10.0003 16.6666Z"
									stroke="#A4A7AE"
									strokeWidth="1.66667"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>
					<svg
						width="100%"
						height="1"
						viewBox="0 0 1216 1"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="h-px"
					>
						<path fillRule="evenodd" clipRule="evenodd" d="M1216 1H0V0H1216V1Z" fill="#E9EAEB" />
					</svg>
				</div>

				{/* Table */}
				<div className="flex items-start overflow-x-auto">
					<div className="flex min-h-0 min-w-[280px] flex-1 flex-col items-start sm:min-w-0">
						{/* Table Header */}
						<div className="flex h-11 max-h-11 items-center gap-3 self-stretch border-b border-[#E9EAEB] bg-white px-4 py-3 sm:px-6">
							<div className="flex items-center justify-center">
								<button className="h-5 w-5 cursor-pointer rounded-md border border-[#D5D7DA] transition-colors hover:border-[#A4A7AE] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"></button>
							</div>
							<div className="flex items-center gap-1">
								<span className="font-inter text-xs font-semibold leading-[18px] text-[#717680]">Name</span>
							</div>
						</div>

						{/* Table Rows */}
						{teamMembers.map((member, index) => (
							<div
								key={member.id}
								className={cx(
									"flex h-[72px] max-h-[72px] items-center gap-3 self-stretch border-b border-[#E9EAEB] px-4 py-4 transition-colors sm:px-6",
									index % 2 === 0 ? "bg-[#FDFDFD] hover:bg-gray-50" : "bg-white hover:bg-gray-50"
								)}
							>
								<div className="flex items-start">
									<div className="flex items-center justify-center">
										<div className="h-5 w-5 rounded-md border border-[#D5D7DA]"></div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									{member.avatar ? (
										<div
											className="h-10 w-10 rounded-full border border-[rgba(0,0,0,0.08)] bg-cover bg-center bg-no-repeat"
											style={{ backgroundImage: `url(${member.avatar})` }}
										/>
									) : (
										<div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E9EAEB] bg-[#F5F5F5] px-0 py-2">
											<span className="font-inter text-base font-semibold leading-6 text-[#717680]">
												{member.initials}
											</span>
										</div>
									)}
									<div className="flex flex-col items-start">
										<span className="font-inter text-sm font-medium leading-5 text-[#181D27]">
											{member.name}
										</span>
										<span className="font-inter text-sm font-normal leading-5 text-[#535862]">
											{member.username}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Status Column */}
					<div className="flex w-[110px] flex-col items-start sm:w-[120px]">
						<div className="flex h-11 max-h-11 items-center gap-3 self-stretch border-b border-[#E9EAEB] bg-white px-6 py-3">
							<div className="flex items-center gap-1">
								<span className="font-inter text-xs font-semibold leading-[18px] text-[#717680]">Status</span>
								<ArrowDown className="h-3 w-3 text-[#A4A7AE]" strokeWidth={1.5} />
							</div>
						</div>
						{teamMembers.map((member, index) => (
							<div
								key={member.id}
								className={cx(
									"flex h-[72px] max-h-[72px] items-center self-stretch border-b border-[#E9EAEB] px-6 py-4 transition-colors",
									index % 2 === 0 ? "bg-[#FDFDFD] hover:bg-gray-50" : "bg-white hover:bg-gray-50"
								)}
							>
								<div className="flex items-center gap-1 rounded-md border border-[#D5D7DA] bg-white px-1.5 py-0.5 shadow-[0_1px_2px_0_rgba(10,13,18,0.05)]">
									<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
										<circle cx="4" cy="4" r="3" fill="#17B26A" />
									</svg>
									<span className="text-center font-inter text-xs font-medium leading-[18px] text-[#414651]">
										{member.status}
									</span>
								</div>
							</div>
						))}
					</div>

					{/* Role Column */}
					<div className="flex w-[140px] flex-col items-start sm:w-[176px]">
						<div className="flex h-11 max-h-11 items-center gap-3 self-stretch border-b border-[#E9EAEB] bg-white px-6 py-3">
							<div className="flex items-center gap-1">
								<span className="font-inter text-xs font-semibold leading-[18px] text-[#717680]">Role</span>
								<HelpCircle className="h-4 w-4 text-[#A4A7AE]" strokeWidth={1.33333} />
							</div>
						</div>
						{teamMembers.map((member, index) => (
							<div
								key={member.id}
								className={cx(
									"flex h-[72px] max-h-[72px] items-center gap-3 self-stretch border-b border-[#E9EAEB] px-4 py-4 transition-colors sm:px-6",
									index % 2 === 0 ? "bg-[#FDFDFD] hover:bg-gray-50" : "bg-white hover:bg-gray-50"
								)}
							>
								<div className="flex flex-col items-start">
									<span className="font-inter text-sm font-normal leading-5 text-[#535862]">
										{member.role}
									</span>
								</div>
							</div>
						))}
					</div>

					{/* Email Column */}
					<div className="hidden flex-col items-start lg:flex lg:w-[224px]">
						<div className="flex h-11 max-h-11 items-center gap-3 self-stretch border-b border-[#E9EAEB] bg-white px-6 py-3">
							<div className="flex items-center gap-1">
								<span className="font-inter text-xs font-semibold leading-[18px] text-[#717680]">
									Email address
								</span>
							</div>
						</div>
						{teamMembers.map((member, index) => (
							<div
								key={member.id}
								className={cx(
									"flex h-[72px] max-h-[72px] items-center gap-3 self-stretch border-b border-[#E9EAEB] px-4 py-4 transition-colors sm:px-6",
									index % 2 === 0 ? "bg-[#FDFDFD] hover:bg-gray-50" : "bg-white hover:bg-gray-50"
								)}
							>
								<div className="flex flex-col items-start">
									<span className="font-inter text-sm font-normal leading-5 text-[#535862]">
										{member.email}
									</span>
								</div>
							</div>
						))}
					</div>

					{/* Teams Column */}
					<div className="hidden flex-col items-start xl:flex xl:w-[288px]">
						<div className="flex h-11 max-h-11 items-center gap-3 self-stretch border-b border-[#E9EAEB] bg-white px-6 py-3">
							<div className="flex items-center gap-1">
								<span className="font-inter text-xs font-semibold leading-[18px] text-[#717680]">Teams</span>
							</div>
						</div>
						{teamMembers.map((member, index) => (
							<div
								key={member.id}
								className={cx(
									"flex h-[72px] max-h-[72px] items-center self-stretch border-b border-[#E9EAEB] px-6 py-4 transition-colors",
									index % 2 === 0 ? "bg-[#FDFDFD] hover:bg-gray-50" : "bg-white hover:bg-gray-50"
								)}
							>
								<div className="flex items-start gap-1">
									{member.teams.map((team, idx) => {
										const colors = teamBadgeColors[team as keyof typeof teamBadgeColors];
										return (
											<span
												key={idx}
												className="inline-flex items-center rounded-2xl px-2 py-0.5"
												style={{
													backgroundColor: colors.bg,
													borderWidth: "1px",
													borderColor: colors.border,
													color: colors.text,
												}}
											>
												<span className="text-center font-inter text-xs font-medium leading-[18px]">
													{team}
												</span>
											</span>
										);
									})}
								</div>
							</div>
						))}
					</div>

					{/* Actions Column */}
					<div className="flex flex-col items-start">
						<div className="flex h-11 max-h-11 items-center gap-3 self-stretch border-b border-[#E9EAEB] bg-white px-6 py-3"></div>
						{teamMembers.map((member, index) => (
							<div
								key={member.id}
								className={cx(
									"flex h-[72px] max-h-[72px] items-center gap-0.5 self-stretch border-b border-[#E9EAEB] px-4 py-4 transition-colors",
									index % 2 === 0 ? "bg-[#FDFDFD] hover:bg-gray-50" : "bg-white hover:bg-gray-50"
								)}
							>
								<button className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
									<Trash01 className="h-4 w-4 text-[#A4A7AE] transition-colors hover:text-[#717680]" strokeWidth={1.5} />
								</button>
								<button className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
									<Edit01 className="h-4 w-4 text-[#A4A7AE] transition-colors hover:text-[#717680]" strokeWidth={1.5} />
								</button>
							</div>
						))}
					</div>
				</div>

				{/* Pagination */}
				<div className="flex items-center justify-between gap-3 border-t border-[#E9EAEB] px-4 py-3 sm:px-6">
					{/* Previous Button */}
					<div className="flex flex-1 items-center sm:flex-initial">
						<button
							disabled={currentPage === 1}
							onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
							className="flex items-center justify-center gap-1 rounded-lg border border-[#E9EAEB] bg-white p-2 shadow-[0_1px_2px_0_rgba(10,13,18,0.05)] transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white sm:px-3 sm:py-2"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M15.8332 9.99996H4.1665M4.1665 9.99996L9.99984 15.8333M4.1665 9.99996L9.99984 4.16663"
									stroke={currentPage === 1 ? "#D5D7DA" : "#A4A7AE"}
									strokeWidth="1.66667"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<span className={cx("hidden font-inter text-sm font-semibold leading-5 sm:inline", currentPage === 1 ? "text-[#A4A7AE]" : "text-[#414651]")}>
								Previous
							</span>
						</button>
					</div>

					{/* Page Info - Mobile Only */}
					<div className="flex items-center sm:hidden">
						<span className="font-inter text-sm font-medium leading-5 text-[#414651]">
							Page {currentPage} of {totalPages}
						</span>
					</div>

					{/* Page Numbers - Desktop Only */}
					<div className="hidden items-start gap-0.5 overflow-x-auto sm:flex">
						{getPaginationItems().map((item, idx) => {
							if (item === "ellipsis") {
								return (
									<div key={`ellipsis-${idx}`} className="flex h-10 w-10 items-center justify-center rounded-lg">
										<span className="text-center font-inter text-sm font-medium leading-5 text-[#717680]">
											...
										</span>
									</div>
								);
							}

							const isActive = item === currentPage;

							return (
								<button
									key={item}
									onClick={() => setCurrentPage(item)}
									className={cx(
										"flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200",
										isActive ? "bg-[#FAFAFA]" : "hover:bg-gray-100"
									)}
								>
									<span className="text-center font-inter text-sm font-medium leading-5 text-[#414651]">
										{item}
									</span>
								</button>
							);
						})}
					</div>

					{/* Next Button */}
					<div className="flex flex-1 items-center justify-end sm:flex-initial">
						<button
							disabled={currentPage === totalPages}
							onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
							className="flex items-center justify-center gap-1 rounded-lg border border-[#D5D7DA] bg-white p-2 shadow-[0_0_0_1px_rgba(10,13,18,0.18)_inset,0_-2px_0_0_rgba(10,13,18,0.05)_inset,0_1px_2px_0_rgba(10,13,18,0.05)] transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white sm:px-3 sm:py-2"
						>
							<span className="hidden font-inter text-sm font-semibold leading-5 text-[#414651] sm:inline">Next</span>
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M4.16699 9.99996H15.8337M15.8337 9.99996L10.0003 4.16663M15.8337 9.99996L10.0003 15.8333"
									stroke="#A4A7AE"
									strokeWidth="1.66667"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
