import React from "react";
import Billing from "@/components/organisms/Billing";
import Breadcrumb from "@/components/atoms/DashboardBreadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: `Billing - ${process.env.SITE_NAME}`,
	description: `This is Billing page for ${process.env.SITE_NAME}`,
	// other discriptions
};

const BillingPage = () => {
	return (
		<>
			<Breadcrumb pageTitle='Billing' />
			<Billing />
		</>
	);
};

export default BillingPage;
