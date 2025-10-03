import Breadcrumb from "@/components/atoms/DashboardBreadcrumb";
import EditProfile from "@/components/molecules/EditProfile";
import PasswordChange from "@/components/molecules/PasswordChange";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: `Account Settings - ${process.env.SITE_NAME}`,
	description: `Account Settings Description`,
};

export default function AccountSettingsPage() {
	return (
		<>
			<Breadcrumb pageTitle='Account Settings' />

			<div className='flex flex-wrap gap-11 lg:flex-nowrap'>
				<EditProfile />

				<PasswordChange />
			</div>
		</>
	);
}
