import Hero from "./Hero";
import Counter from "./Counter";
import { CallToAction } from "./CallToAction";
import FAQ from "./FAQ";
import Blog from "./Blog";
import Newsletter from "./Newsletter";
import { GlassmorphismBackground } from "@/components/atoms";
import { Particles } from "@/components/ui";

interface HomeProps {
	dictionary: {
		hero: {
			introducing: string;
			title: string[];
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
			<Hero dictionary={dictionary} />
			<Counter dictionary={dictionary} />




			<CallToAction dictionary={dictionary} />
			<FAQ dictionary={dictionary} />
			<div id='newsletter'>
				<Newsletter dictionary={dictionary} />
			</div>
			<Blog dictionary={dictionary} />
		</main>
	);
};

export default Home;
