"use client";

import { useState } from "react";
import { DownloadCloud02, Plus, Trash01, Edit01, ArrowLeft, ArrowRight } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Avatar } from "@/components/base/avatar/avatar";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { UntitledPagination } from "@/components/application/pagination/pagination-untitled";
import { cx } from "@/utils/cx";

type TeamMemberStatus = "active" | "offline";

interface TeamMember {
	id: string;
	name: string;
	username: string;
	email: string;
	avatar?: string;
	initials?: string;
	status: TeamMemberStatus;
	teams: Array<{
		name: string;
		color: "brand" | "blue" | "pink" | "success" | "indigo" | "purple";
	}>;
}

const mockTeamMembers: TeamMember[] = [
	{
		id: "1",
		name: "Olivia Rhye",
		username: "@olivia",
		email: "olivia@untitledui.com",
		avatar: "https://i.pravatar.cc/100?img=1",
		status: "active",
		teams: [
			{ name: "Design", color: "brand" },
			{ name: "Product", color: "blue" },
		],
	},
	{
		id: "2",
		name: "Phoenix Baker",
		username: "@phoenix",
		email: "phoenix@untitledui.com",
		avatar: "https://i.pravatar.cc/100?img=2",
		status: "active",
		teams: [
			{ name: "Product", color: "blue" },
			{ name: "Software Engineering", color: "success" },
		],
	},
	{
		id: "3",
		name: "Lana Steiner",
		username: "@lana",
		email: "lana@untitledui.com",
		avatar: "https://i.pravatar.cc/100?img=3",
		status: "offline",
		teams: [
			{ name: "Operations", color: "pink" },
			{ name: "Product", color: "blue" },
		],
	},
	{
		id: "4",
		name: "Demi Wilkinson",
		username: "@demi",
		email: "demi@untitledui.com",
		avatar: "https://i.pravatar.cc/100?img=4",
		status: "active",
		teams: [
			{ name: "Design", color: "brand" },
			{ name: "Product", color: "blue" },
			{ name: "Software Engineering", color: "success" },
		],
	},
	{
		id: "5",
		name: "Candice Wu",
		username: "@candice",
		email: "candice@untitledui.com",
		initials: "CW",
		status: "offline",
		teams: [
			{ name: "Operations", color: "pink" },
			{ name: "Finance", color: "purple" },
		],
	},
	{
		id: "6",
		name: "Natali Craig",
		username: "@natali",
		email: "natali@untitledui.com",
		avatar: "https://i.pravatar.cc/100?img=5",
		status: "active",
		teams: [
			{ name: "Design", color: "brand" },
			{ name: "Finance", color: "indigo" },
		],
	},
	{
		id: "7",
		name: "Drew Cano",
		username: "@drew",
		email: "drew@untitledui.com",
		avatar: "https://i.pravatar.cc/100?img=6",
		status: "active",
		teams: [
			{ name: "Customer Success", color: "indigo" },
			{ name: "Operations", color: "pink" },
			{ name: "Finance", color: "indigo" },
		],
	},
	{
		id: "8",
		name: "Orlando Diggs",
		username: "@orlando",
		email: "orlando@untitledui.com",
		avatar: "https://i.pravatar.cc/100?img=7",
		status: "active",
		teams: [
			{ name: "Product", color: "blue" },
			{ name: "Software Engineering", color: "success" },
		],
	},
];

const StatusBadge = ({ status }: { status: TeamMemberStatus }) => {
	const config = {
		active: { color: "success" as const, label: "Active" },
		offline: { color: "gray" as const, label: "Offline" },
	};

	const { color, label } = config[status];

	return (
		<BadgeWithDot type="modern" size="sm" color={color}>
			{label}
		</BadgeWithDot>
	);
};

export function TeamTab() {
	const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;

	const totalPages = Math.ceil(mockTeamMembers.length / itemsPerPage);
	const paginatedMembers = mockTeamMembers.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const isAllSelected =
		paginatedMembers.length > 0 &&
		paginatedMembers.every((member) => selectedMembers.has(member.id));
	const isIndeterminate =
		paginatedMembers.some((member) => selectedMembers.has(member.id)) &&
		!isAllSelected;

	const handleSelectAll = () => {
		if (isAllSelected) {
			const newSelected = new Set(selectedMembers);
			paginatedMembers.forEach((member) => newSelected.delete(member.id));
			setSelectedMembers(newSelected);
		} else {
			const newSelected = new Set(selectedMembers);
			paginatedMembers.forEach((member) => newSelected.add(member.id));
			setSelectedMembers(newSelected);
		}
	};

	const handleSelectMember = (id: string) => {
		const newSelected = new Set(selectedMembers);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedMembers(newSelected);
	};

	const handleDownloadCSV = () => {
		console.log("Downloading CSV...");
	};

	const handleAddUser = () => {
		console.log("Adding new user...");
	};

	const handleEditMember = (id: string) => {
		console.log("Editing member:", id);
	};

	const handleDeleteMember = (id: string) => {
		console.log("Deleting member:", id);
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-6 px-4 lg:px-8">
				{/* Card */}
				<div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
					{/* Card Header */}
					<div className="flex flex-col gap-5 bg-white px-4 pt-5 lg:px-6 dark:bg-gray-900">
						<div className="flex flex-col items-start gap-4">
							{/* Title and Description */}
							<div className="flex flex-col gap-0.5 self-stretch">
								<div className="flex items-center gap-2">
									<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
										Team members
									</h2>
									<BadgeWithDot type="modern" size="sm" color="gray">
										48 users
									</BadgeWithDot>
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Manage your team members and their account permissions here.
								</p>
							</div>

							{/* Actions */}
							<div className="flex w-full items-center gap-3">
								<Button
									size="md"
									color="secondary"
									iconLeading={DownloadCloud02}
									onClick={handleDownloadCSV}
									className="flex-1"
									aria-label="Download team members as CSV"
								>
									Download CSV
								</Button>
								<Button
									size="md"
									color="primary"
									iconLeading={Plus}
									onClick={handleAddUser}
									className="flex-1"
									aria-label="Add new user"
								>
									Add user
								</Button>
							</div>
						</div>

						{/* Divider */}
						<div className="h-px w-full bg-gray-200 dark:bg-gray-800" />
					</div>

					{/* Table */}
					<div className="bg-white dark:bg-gray-900">
						{/* Desktop Table - Hidden on mobile */}
						<div className="hidden overflow-x-auto lg:block">
							<table className="w-full">
								<thead>
									<tr className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
										<th className="px-6 py-3 text-left">
											<div className="flex items-center gap-3">
												<Checkbox
													size="md"
													isSelected={isAllSelected}
													isIndeterminate={isIndeterminate}
													onChange={handleSelectAll}
													aria-label="Select all team members"
												/>
												<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
													Name
												</span>
											</div>
										</th>
										<th className="px-6 py-3 text-left">
											<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
												Status
											</span>
										</th>
										<th className="px-6 py-3 text-left">
											<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
												Email address
											</span>
										</th>
										<th className="px-6 py-3 text-left">
											<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
												Teams
											</span>
										</th>
										<th className="px-6 py-3"></th>
									</tr>
								</thead>
								<tbody>
									{paginatedMembers.map((member, index) => (
										<tr
											key={member.id}
											className={cx(
												"border-b border-gray-200 dark:border-gray-800",
												index % 2 === 0
													? "bg-gray-25 dark:bg-gray-950"
													: "bg-white dark:bg-gray-900"
											)}
										>
											{/* Name Column */}
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<Checkbox
														size="md"
														isSelected={selectedMembers.has(member.id)}
														onChange={() => handleSelectMember(member.id)}
														aria-label={`Select ${member.name}`}
													/>
													<Avatar
														size="md"
														src={member.avatar}
														initials={member.initials}
														alt={member.name}
														contrastBorder
													/>
													<div className="flex flex-col">
														<span className="text-sm font-medium text-gray-900 dark:text-white">
															{member.name}
														</span>
														<span className="text-sm text-gray-600 dark:text-gray-400">
															{member.username}
														</span>
													</div>
												</div>
											</td>

											{/* Status Column */}
											<td className="px-6 py-4">
												<StatusBadge status={member.status} />
											</td>

											{/* Email Column */}
											<td className="px-6 py-4">
												<span className="text-sm text-gray-600 dark:text-gray-400">
													{member.email}
												</span>
											</td>

											{/* Teams Column */}
											<td className="px-6 py-4">
												<div className="flex flex-wrap items-center gap-1">
													{member.teams.map((team, teamIndex) => (
														<BadgeWithDot
															key={teamIndex}
															type="modern"
															size="sm"
															color={team.color}
														>
															{team.name}
														</BadgeWithDot>
													))}
												</div>
											</td>

											{/* Actions Column */}
											<td className="px-4 py-4">
												<div className="flex items-center gap-0.5">
													<button
														onClick={() => handleDeleteMember(member.id)}
														className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
														aria-label={`Delete ${member.name}`}
													>
														<Trash01 className="size-4" />
													</button>
													<button
														onClick={() => handleEditMember(member.id)}
														className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
														aria-label={`Edit ${member.name}`}
													>
														<Edit01 className="size-4" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile List - Visible only on mobile */}
						<div className="flex flex-col lg:hidden">
							{/* Mobile Header */}
							<div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
								<Checkbox
									size="md"
									isSelected={isAllSelected}
									isIndeterminate={isIndeterminate}
									onChange={handleSelectAll}
									aria-label="Select all team members"
								/>
								<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
									Name
								</span>
							</div>

							{/* Mobile Rows */}
							{paginatedMembers.map((member, index) => (
								<div
									key={member.id}
									className={cx(
										"flex items-center gap-3 border-b border-gray-200 px-4 py-4 dark:border-gray-800",
										index % 2 === 0
											? "bg-gray-25 dark:bg-gray-950"
											: "bg-white dark:bg-gray-900"
									)}
								>
									<Checkbox
										size="md"
										isSelected={selectedMembers.has(member.id)}
										onChange={() => handleSelectMember(member.id)}
										aria-label={`Select ${member.name}`}
									/>
									<Avatar
										size="md"
										src={member.avatar}
										initials={member.initials}
										alt={member.name}
										contrastBorder
									/>
									<div className="flex flex-col">
										<span className="text-sm font-medium text-gray-900 dark:text-white">
											{member.name}
										</span>
										<span className="text-sm text-gray-600 dark:text-gray-400">
											{member.username}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Pagination */}
					<div className="hidden lg:block">
						<UntitledPagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							className="border-t border-gray-200 dark:border-gray-800"
						/>
					</div>

					{/* Mobile Pagination */}
					<div className="flex items-center justify-between border-t border-gray-200 px-4 pt-4 dark:border-gray-800 lg:hidden">
						<button
							disabled={currentPage <= 1}
							onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
							aria-label="Previous page"
							className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 shadow-xs transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
						>
							<ArrowLeft className="size-5 text-gray-400 dark:text-gray-500" />
						</button>
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							Page {currentPage} of {totalPages}
						</span>
						<button
							disabled={currentPage >= totalPages}
							onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
							aria-label="Next page"
							className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 shadow-xs transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
						>
							<ArrowRight className="size-5 text-gray-400 dark:text-gray-500" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
