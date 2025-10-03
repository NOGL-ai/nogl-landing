import React from "react";
import MonitoredUrlsTable from "@/components/Competitors/MonitoredUrlsTable";

export const metadata = {
	title: "Monitored URLs",
};

export default function MonitoredUrlsPage() {
	return (
		<div className='mx-auto w-full max-w-7xl space-y-6 p-4 lg:p-6'>
			<div className='flex flex-col gap-2'>
				<div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
					<h1 className='text-2xl font-semibold tracking-tight text-gray-900'>
						Monitored URLs
					</h1>
				</div>
				<p className='text-sm text-gray-600'>
					Track competitor product URLs and compare prices against your catalog.
				</p>
			</div>

			<MonitoredUrlsTable />
		</div>
	);
}
