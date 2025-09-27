import SignupPageLayout from "@/components/Auth/Signup/SignupPageLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: `Sign up - ${process.env.SITE_NAME}`,
	description: `This is Sign up page for ${process.env.SITE_NAME}`,
};

const SignupPage = () => {
	return (
		<main className='min-h-screen'>
			<SignupPageLayout />
		</main>
	);
};

export default SignupPage;
