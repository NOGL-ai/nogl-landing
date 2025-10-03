import DataStatsCard from "@/components/atoms/DataStatsCard";
import GraphCard from "@/components/molecules/GraphCard";
import Breadcrumb from "@/components/atoms/DashboardBreadcrumb";
import { dataStats, overviewData } from "@/staticData/statsData";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: `Dashboard - ${process.env.SITE_NAME}`,
	description: `Dashboard Description`,
};

export default function AdminDashboard() {
	return (
		<>
			<Breadcrumb pageTitle='Dashboard' />

			<div className='gap-7.5 mb-11 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4'>
				{dataStats.map((data) => (
					<DataStatsCard key={data?.id} data={data} />
				))}
			</div>

			<div>
				<div className='mb-7.5'>
					<h3 className='font-satoshi text-heading-5 text-dark mb-2 font-bold tracking-[-.5px] dark:text-white'>
						Overview
					</h3>
					<p className='font-satoshi text-body dark:text-gray-4 font-medium tracking-[-.2px]'>
						An overview of your organization’s activity and performance across
						all your projects.
					</p>
				</div>

				<div className='gap-7.5 grid md:grid-cols-2 xl:grid-cols-3'>
					{overviewData.map((data) => (
						<GraphCard key={data?.id} data={data} />
					))}
				</div>
			</div>
		</>
	);
}
