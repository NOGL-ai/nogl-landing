// import HomeHero from "@/components/organisms/HomeHero";
import NOGLHero from "@/components/organisms/NOGLHero";
import HomeCounter from "@/components/organisms/HomeCounter";
import HomeCallToAction from "@/components/organisms/HomeCallToAction";
import FAQ from "@/components/organisms/FAQ";
import HomeBlog from "@/components/organisms/HomeBlog";
import HomeNewsletter from "@/components/organisms/HomeNewsletter";
import GlassmorphismBackground from "@/components/atoms/GlassmorphismBackground";
import { Particles } from "@/components/ui";

interface HomeProps {
	dictionary: {
		hero: {
			introducing: string;
			title: string;
			description: string;
			buttonText: string;
		};
		counter: {
			title: string;
			stats: {
				value: string;
				label: string;
			}[];
			heading: string;
			aboutButton: string;
		};
		callToAction: {
			title: string;
			description: string;
			buttonText: string;
			buttonUrl: string;
			testimonial: {
				heading: string;
				subheading: string;
				quote: string;
				author: string;
				role: string;
				waitlistButton: string;
			};
		};
		faq: {
			title: string;
			description: string;
			items: {
				id: number;
				question: string;
				answer: string;
			}[];
		};
		newsletter: {
			title: string;
			description: string;
			emailPlaceholder: string;
			buttonText: string;
			successMessage: string;
			errorMessage: string;
			invalidEmailMessage: string;
		};
		blog: {
			title: string;
			description: string;
			viewAllText: string;
			noPostsText: string;
		};
	};
}

const Home: React.FC<HomeProps> = ({ dictionary }) => {
	return (
		<main className='nc-PageHome relative overflow-hidden'>
			<Particles
				className='absolute inset-0 -z-10'
				quantity={5000}
				ease={70}
				size={0.5}
				staticity={40}
				color={"#4F46E5"}
			/>
			<GlassmorphismBackground />
			{/* <HomeHero dictionary={dictionary} /> */}
			<NOGLHero />
			<HomeCounter dictionary={dictionary} />

			<HomeCallToAction dictionary={dictionary} />
			<FAQ dictionary={dictionary} />
			<div id='newsletter'>
				<HomeNewsletter dictionary={dictionary} />
			</div>
			<HomeBlog dictionary={dictionary} />
		</main>
	);
};

export default Home;
