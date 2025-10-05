"use client";

import React, { useState } from "react";
import {
	DataTableAvatarCell,
	DataTableBadgeGroup,
	DataTableStatusBadge,
	DataTableActionIcons,
	DataTableContainer,
} from "@/components/organisms/tables/DataTable/components";
import { UntitledPagination } from "@/components/application/pagination/pagination-untitled";

const sampleUsers = [
	{
		id: 1,
		name: "Olivia Rhye",
		email: "olivia@untitledui.com",
		avatar: "https://i.pravatar.cc/150?img=1",
		status: "active" as const,
		tags: [
			{ label: "Design", color: "brand" as const },
			{ label: "Product", color: "success" as const },
			{ label: "Marketing", color: "warning" as const },
			{ label: "Sales", color: "error" as const },
			{ label: "Development", color: "gray" as const },
		],
	},
	{
		id: 2,
		name: "Phoenix Baker",
		email: "phoenix@untitledui.com",
		avatar: "https://i.pravatar.cc/150?img=2",
		status: "active" as const,
		tags: [
			{ label: "Engineering", color: "brand" as const },
			{ label: "Frontend", color: "success" as const },
		],
	},
	{
		id: 3,
		name: "Lana Steiner",
		email: "lana@untitledui.com",
		avatar: "https://i.pravatar.cc/150?img=3",
		status: "inactive" as const,
		tags: [
			{ label: "Backend", color: "brand" as const },
			{ label: "API", color: "gray" as const },
		],
	},
];

export default function TestTableUntitledPage() {
	const [currentPage, setCurrentPage] = useState(1);

	return (
		<div className="container mx-auto py-8">
			<header className="mb-8">
				<h1 className="mb-4 text-3xl font-bold">Untitled UI Table Components</h1>
				<p className="mb-6 text-gray-600">
					This page showcases the new table components designed to match the Untitled UI design system.
				</p>
			</header>

			<main className="space-y-8">
				{/* Avatar Cell Component */}
				<section>
					<h2 className="mb-4 text-xl font-semibold">Avatar + Text Cell</h2>
					<div className="space-y-3 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
						<DataTableAvatarCell
							src="https://i.pravatar.cc/150?img=1"
							alt="User avatar"
							title="Olivia Rhye"
							subtitle="olivia@untitledui.com"
							size="sm"
						/>
						<DataTableAvatarCell
							src="https://i.pravatar.cc/150?img=2"
							alt="User avatar"
							title="Phoenix Baker"
							subtitle="phoenix@untitledui.com"
							size="md"
							verified
						/>
					</div>
				</section>

				{/* Badge Group Component */}
				<section>
					<h2 className="mb-4 text-xl font-semibold">Badge Group with Overflow</h2>
					<div className="space-y-3 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
						<DataTableBadgeGroup
							items={[
								{ label: "Design", color: "brand" },
								{ label: "Product", color: "success" },
								{ label: "Marketing", color: "warning" },
								{ label: "Sales", color: "error" },
								{ label: "Development", color: "gray" },
							]}
							maxVisible={3}
						/>
						<DataTableBadgeGroup
							items={[
								{ label: "Engineering", color: "brand" },
								{ label: "Frontend", color: "success" },
							]}
							maxVisible={3}
						/>
					</div>
				</section>

				{/* Status Badge Component */}
				<section>
					<h2 className="mb-4 text-xl font-semibold">Status Badge with Dot</h2>
					<div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
						<DataTableStatusBadge status="active" />
						<DataTableStatusBadge status="inactive" />
						<DataTableStatusBadge status="pending" />
						<DataTableStatusBadge status="error" />
						<DataTableStatusBadge status="success" />
					</div>
				</section>

				{/* Action Icons Component */}
				<section>
					<h2 className="mb-4 text-xl font-semibold">Action Icons</h2>
					<div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
						<DataTableActionIcons
							onEdit={() => console.log("Edit clicked")}
							onDelete={() => console.log("Delete clicked")}
						/>
					</div>
				</section>

				{/* Full Table Example */}
				<section>
					<h2 className="mb-4 text-xl font-semibold">Complete Table Example</h2>
					<DataTableContainer variant="untitled-ui">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
									<tr>
										<th className="px-6 py-3 text-left">
											<input type="checkbox" className="rounded border-gray-300" />
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
											Company
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
											Tags
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
									{sampleUsers.map((user) => (
										<tr
											key={user.id}
											className="hover:bg-gray-50 dark:hover:bg-gray-800"
										>
											<td className="px-6 py-4">
												<input type="checkbox" className="rounded border-gray-300" />
											</td>
											<td className="px-6 py-4">
												<DataTableAvatarCell
													src={user.avatar}
													alt={user.name}
													title={user.name}
													subtitle={user.email}
													size="sm"
												/>
											</td>
											<td className="px-6 py-4">
												<DataTableStatusBadge status={user.status} />
											</td>
											<td className="px-6 py-4">
												<DataTableBadgeGroup items={user.tags} maxVisible={3} />
											</td>
											<td className="px-6 py-4">
												<DataTableActionIcons
													onEdit={() => console.log(`Edit ${user.name}`)}
													onDelete={() => console.log(`Delete ${user.name}`)}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<UntitledPagination
							currentPage={currentPage}
							totalPages={10}
							onPageChange={setCurrentPage}
						/>
					</DataTableContainer>
				</section>

				{/* Pagination Component */}
				<section>
					<h2 className="mb-4 text-xl font-semibold">Pagination</h2>
					<div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
						<UntitledPagination
							currentPage={currentPage}
							totalPages={10}
							onPageChange={setCurrentPage}
						/>
					</div>
				</section>
			</main>
		</div>
	);
}
