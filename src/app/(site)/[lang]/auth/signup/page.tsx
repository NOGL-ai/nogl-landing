import React from "react";
import Signup from "@/components/organisms/Signup";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: `Sign up - ${process.env.SITE_NAME}`,
	description: `This is Sign up page for ${process.env.SITE_NAME}`,
};

const SignupPage = () => {
	return <Signup />;
};

export default SignupPage;
