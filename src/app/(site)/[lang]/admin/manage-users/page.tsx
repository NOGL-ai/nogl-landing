import UsersListContainer from "@/components/organisms/UsersListContainer";
import Breadcrumb from "@/components/atoms/DashboardBreadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: `Users - ${process.env.SITE_NAME}`,
	description: `Users Description`,
};

export default async function UsersPage({
	searchParams,
}: {
	searchParams: Promise<{ filter: string; search: string }>;
}) {
	const { filter, search } = await searchParams;
	const validFilter =
		filter === "USER" || filter === "ADMIN" ? filter : undefined;

	return (
		<>
			<Breadcrumb pageTitle='Manage Users' />

			<UsersListContainer filter={validFilter} search={search} />
		</>
	);
}
