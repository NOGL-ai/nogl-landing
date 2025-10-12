import "@/styles/satoshi.scss";
import "react-quill/dist/quill.snow.css";
import "@/fonts/line-awesome-1.3.0/css/line-awesome.css";
import { Providers } from "./providers";
import NextTopLoader from "nextjs-toploader";
import Loader from "@/components/molecules/PreLoader";
import Footer from "@/components/organisms/MainFooter";
import { HeaderWrapper } from "@/components/molecules/HeaderWrapper";
// import AuthCheck from "./AuthCheck";
import { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";

export default async function RootLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
}) {
	const session = await getAuthSession();
	const { lang } = await params;

	return (
		<>
			<Loader />
			<Providers session={session}>
				<div className="flex flex-col min-h-screen">
					{/* <AuthCheck> */}
					<NextTopLoader
						color='#635BFF'
						crawlSpeed={300}
						showSpinner={false}
						shadow='none'
					/>
					<HeaderWrapper />
					<div className="flex-1 min-h-0 h-full">
						{children}
					</div>
					<Footer lang={lang} />
					{/* </AuthCheck> */}
				</div>
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
