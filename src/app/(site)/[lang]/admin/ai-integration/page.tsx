import Breadcrumb from "@/components/atoms/DashboardBreadcrumb";
import { Metadata } from "next";
import AiIntegration from "@/components/organisms/AiIntegration";

export const metadata: Metadata = {
	title: `AI Integration - ${process.env.SITE_NAME}`,
	description: `AI Integration Description`,
};

export default function AiIntegrationPage() {
	const key = process.env.OPENAI_API_KEY as string;
	return (
		<>
			<Breadcrumb pageTitle='AI Integration' />

			<AiIntegration APIKey={key} />
		</>
	);
}
