import Hero from "./Hero";
import Features from "./Features";
import FeaturesWithImage from "./FeaturesWithImage";
import FeatureSlideshow from "./FeatureSlideshow";
import Counter from "./Counter";
import { CallToAction } from "./CallToAction";
import Testimonials from "@/components/testimonials";
// import Pricing from "./Pricing";
import FAQ from "./FAQ";
import Blog from "./Blog";
import Newsletter from "./Newsletter";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import SectionSliderNewCategories from "@/components/SectionSliderNewCategories";
import SectionGridAuthorBox from "@/components/SectionGridAuthorBox";
import BackgroundSection from "@/components/BackgroundSection";
import Logos from "@/components/logos";
import Particles from "@/components/ui/particles";
import Problem from "./Problem";
import Solution from "./Solution";
import FeaturesHorizontal from "./FeaturesHorizantal";
// import FeatureScroll from "./Features/FeatureScroll";

interface HomeProps {
	dictionary: any; // Type this based on your dictionary structure
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
			<BgGlassmorphism />
			<Hero dictionary={dictionary} />
			{/* <Logos /> */}
			{/* <Problem dictionary={dictionary} /> */}
			{/* <Solution dictionary={dictionary} /> */}
			<Counter dictionary={dictionary} />
			{/* <FeatureScroll dictionary={dictionary} /> */}
			{/* <FeaturesHorizontal /> */}
			{/* <Features />
      <FeaturesWithImage />
      <FeatureSlideshow />  */}

			{/* Comment out SectionSliderNewCategories */}
			{/* <div className="relative py-16 mt-20">
        <BackgroundSection className="bg-orange-50 dark:bg-black/20" />
        <SectionSliderNewCategories
          categoryCardType="card3"
          itemPerRow={4}
          heading="Explore Trending Sessions"
          subHeading="Discover the most popular expert-led sessions on our platform"
          sliderStyle="style2"
          className="container mx-auto backdrop-blur-sm"
        />
      </div> */}

			{/* Comment out SectionGridFeaturePlaces */}
			{/* <div className="mt-20">
        <SectionGridFeaturePlaces
          cardType="card2"
          className="container mx-auto backdrop-blur-sm"
        />
      </div> */}

			{/* Comment out SectionGridAuthorBox */}
			{/* <div className="relative py-8 sm:py-10 md:py-12 lg:py-14 mt-10 sm:mt-12 md:mt-16 lg:mt-20">
        <BackgroundSection className="bg-orange-50 dark:bg-black/20" />
        <SectionGridAuthorBox
          boxCard="box2"
          className="container mx-auto backdrop-blur-sm px-4 sm:px-6 lg:px-8"
        />
      </div> */}

			<CallToAction dictionary={dictionary} />
			{/* Comment out Testimonials */}
			{/* <div className="relative py-16">
        <Testimonials />
      </div> */}
			{/* <Pricing dictionary={dictionary} /> */}
			<FAQ dictionary={dictionary} />
			<div id='newsletter'>
				<Newsletter dictionary={dictionary} />
			</div>
			<Blog dictionary={dictionary} />
		</main>
	);
};

export default Home;
