import React from "react";
import PurchaseHistory from "@/components/organisms/PurchaseHistory";
import Breadcrumb from "@/components/atoms/DashboardBreadcrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
	title: `Invoice - ${process.env.SITE_NAME}`,
	description: `This is Invoice page for ${process.env.SITE_NAME}`,
	// other discriptions
};

const PurchseHistoryPage = () => {
	return (
		<>
			<Breadcrumb pageTitle='Invoice' />
			<PurchaseHistory />
		</>
	);
};

export default PurchseHistoryPage;
