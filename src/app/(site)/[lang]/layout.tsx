import "@/styles/satoshi.scss";
import "react-quill/dist/quill.snow.css";
import "@/fonts/line-awesome-1.3.0/css/line-awesome.css";
import { Providers } from "./providers";
import NextTopLoader from "nextjs-toploader";
import Loader from "@/components/Common/PreLoader";
import FooterWrapper from "@/components/Footer/FooterWrapper";
import { HeaderWrapper } from "@/components/Header/HeaderWrapper";
// import AuthCheck from "./AuthCheck";
import { Metadata } from "next";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Loader />
			<Providers>
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
