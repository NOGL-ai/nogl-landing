"use client";
import { usePathname, useParams } from "next/navigation";
import Footer from "../organisms/MainFooter";

const FooterWrapper = () => {
	const pathname = usePathname();
	const params = useParams();
	const lang = params?.lang as string;

	// Check if current path is an auth route
	const isAuthRoute = pathname.includes("/auth/");

	return (
		<>
			{!pathname.startsWith("/admin") && 
			 !pathname.startsWith("/user") && 
			 !isAuthRoute && (
				<Footer lang={lang} />
			)}
		</>
	);
};

export default FooterWrapper;
