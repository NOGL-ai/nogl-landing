import "@/styles/satoshi.scss";
import "react-quill/dist/quill.snow.css";
import "@/fonts/line-awesome-1.3.0/css/line-awesome.css";
import { Providers } from "./providers";
import NextTopLoader from "nextjs-toploader";
import Loader from "@/components/molecules/PreLoader";
import FooterWrapper from "@/components/molecules/FooterWrapper";
import { HeaderWrapper } from "@/components/molecules/HeaderWrapper";
// import AuthCheck from "./AuthCheck";
import { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getAuthSession();

	return (
		<>
			<Loader />
			<Providers session={session}>
				{/* <AuthCheck> */}
				<NextTopLoader
					color='#635BFF'
					crawlSpeed={300}
					showSpinner={false}
					shadow='none'
				/>
				<HeaderWrapper />
				{children}
				<FooterWrapper />
				{/* </AuthCheck> */}
			</Providers>
		</>
	);
}

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL || "http://nogl.ai:3000"
	),
	// ... other metadata
};
