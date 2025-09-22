import BackgroundSection from "@/components/BackgroundSection";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import SectionGridAuthorBox from "@/components/SectionGridAuthorBox";
import SectionSliderNewCategories from "@/components/SectionSliderNewCategories";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import React, { ReactNode } from "react";
import SectionHeroArchivePage from "../(server-components)/SectionHeroArchivePage";
import { TaxonomyType } from "@/data/types";

const DEMO_CATS_2: TaxonomyType[] = [
	{
	  id: "1",
	  href: "/listing-session",
	  name: "AI in Business Strategy",
	  taxonomy: "session",
	  count: 320,
	  thumbnail: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg",
	},
	{
	  id: "2",
	  href: "/listing-session",
	  name: "Mindfulness and Productivity",
	  taxonomy: "session",
	  count: 210,
	  thumbnail: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg",
	},
	{
	  id: "3",
	  href: "/listing-session",
	  name: "Investment Strategies for 2024",
	  taxonomy: "session",
	  count: 250,
	  thumbnail: "https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg",
	},
	{
	  id: "4",
	  href: "/listing-session",
	  name: "SEO Best Practices",
	  taxonomy: "session",
	  count: 320,
	  thumbnail: "https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg",
	},
	{
	  id: "5",
	  href: "/listing-session",
	  name: "Effective Marketing Ads",
	  taxonomy: "session",
	  count: 275,
	  thumbnail: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg",
	},
	{
	  id: "6",
	  href: "/listing-session",
	  name: "Leadership Skills Development",
	  taxonomy: "session",
	  count: 340,
	  thumbnail: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
	},
	{
	  id: "7",
	  href: "/listing-session",
	  name: "Building Resilience in Teams",
	  taxonomy: "session",
	  count: 190,
	  thumbnail: "https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg",
	},
	{
	  id: "8",
	  href: "/listing-session",
	  name: "Advanced Data Analytics",
	  taxonomy: "session",
	  count: 230,
	  thumbnail: "https://images.pexels.com/photos/7567473/pexels-photo-7567473.jpeg",
	},
	{
	  id: "9",
	  href: "/listing-session",
	  name: "Public Speaking Mastery",
	  taxonomy: "session",
	  count: 150,
	  thumbnail: "https://images.pexels.com/photos/2173508/pexels-photo-2173508.jpeg",
	},
	{
	  id: "10",
	  href: "/listing-session",
	  name: "Creative Writing Techniques",
	  taxonomy: "session",
	  count: 210,
	  thumbnail: "https://images.pexels.com/photos/261510/pexels-photo-261510.jpeg",
	},
  ];
  
const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className={`nc-ListingStayPage relative `}>
      <BgGlassmorphism />

      {/* SECTION HERO */}
      <div className="container pt-10 pb-24 lg:pt-16 lg:pb-28">
        <SectionHeroArchivePage currentPage="Experts" currentTab="Experts" />
      </div>

      {children}

      <div className="container overflow-hidden">
        {/* SECTION 1 */}
        <div className="relative py-16">
          <BackgroundSection />
          <SectionSliderNewCategories
            categories={DEMO_CATS_2}
            categoryCardType="card4"
            itemPerRow={4}
            heading="Explore Trending Sessions"
            subHeading="Discover the most popular expert-led sessions on our platform"
            sliderStyle="style2"
            className="container mx-auto bg-white text-base text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200"
          />
        </div>

        {/* SECTION */}
        <SectionSubscribe2 className="py-24 lg:py-28" />
      </div>
    </div>
  );
};

export default Layout;
