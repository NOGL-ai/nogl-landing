import React from "react";
import ResetPassword from "@/components/Auth/ResetPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: `Reset Password - ${process.env.SITE_NAME}`,
	description: `This is Reset Password page for ${process.env.SITE_NAME}`,
};

const ResetPasswordPage = async ({
	params,
}: {
	params: Promise<{ token: string }>;
}) => {
	const { token } = await params;

	if (!token) {
		return <div>Invalid token</div>;
	}

	return (
		<main>
			<ResetPassword token={token} />
		</main>
	);
};

export default ResetPasswordPage;
