"use client";
import { usePathname, useParams } from "next/navigation";
import Footer from "../organisms/MainFooter";

const FooterWrapper = () => {
	const pathname = usePathname();
	const params = useParams();
	const lang = params?.lang as string;

	return (
		<>
			{!pathname.startsWith("/admin") && !pathname.startsWith("/user") && (
				<Footer lang={lang} />
			)}
		</>
	);
};

export default FooterWrapper;
