import React from "react";
import Breadcrumb from "@/components/atoms/DashboardBreadcrumb";
import AccountSettings from "@/components/organisms/AccountSettings";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: `User Dashboard - ${process.env.SITE_NAME}`,
	description: `This is User Dashboard page for ${process.env.SITE_NAME}`,
	// other discriptions
};

const page = () => {
	return (
		<>
			<Breadcrumb pageTitle='Account Settings' />
			<AccountSettings />
		</>
	);
};

export default page;
