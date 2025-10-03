import SendNewsletterCard from "@/components/molecules/SendNewsletterCard";
import Breadcrumb from "@/components/atoms/DashboardBreadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: `Send Newsletter - ${process.env.SITE_NAME}`,
	description: `Send Newsletter Description`,
};

export default function SendNewsletterPage() {
	return (
		<>
			<Breadcrumb pageTitle='Send Newsletter' />

			<SendNewsletterCard />
		</>
	);
}
