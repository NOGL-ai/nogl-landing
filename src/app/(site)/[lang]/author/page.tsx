import React from "react";
import { getAuthorData } from "./utils/getData";
import Sidebar from "@/components/Sidebar";
import TabSection from "./components/TabSection";

// This is now a Server Component
async function AuthorPage() {
	const expertId = "tuhin_mallick";
	const { sessions, error } = await getAuthorData(expertId);

	return (
		<div className="nc-AuthorPage min-h-screen bg-neutral-900/90 pb-24">
			<main className='flex flex-col lg:flex-row'>
				<div className='lg:w-[480px] lg:fixed'>
					<div className='p-4 lg:p-8'>
						<Sidebar 
							name="Kevin Francis"
							shortBio="Product Management Associate at Zoho | Product Manager | Product Marketer | Content Creator"
							longBio="Providing lake views, The Symphony 9 Tam Coc in Ninh Binh provides accommodation, an outdoor..."
							languages={[
								{ name: "English", level: "Native" },
								{ name: "German", level: "Fluent" }
							]}
							topics={["Marketing", "SEO", "Content Strategy", "Product Management"]}
							socialLinks={[
								{ platform: 'linkedin' as const, url: 'https://linkedin.com/in/username' },
								{ platform: 'twitter' as const, url: 'https://twitter.com/username' },
								{ platform: 'youtube' as const, url: 'https://youtube.com/@channel' },
								{ platform: 'instagram' as const, url: 'https://instagram.com/username' }
							]}
						/>
					</div>
				</div>
				<div className='lg:ml-[480px] flex-1 p-4 lg:p-8'>
					<TabSection 
						initialSessions={sessions}
						expertId={expertId}
					/>
				</div>
			</main>
		</div>
	);
}

export default AuthorPage;
