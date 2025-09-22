import React, { FC } from "react";
import SectionHero from "./SectionHero";
import SectionFounder from "./SectionFounder";
import SectionStatistic from "./SectionStatistic";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import BgGlassmorphism from "@/components/BgGlassmorphism";

import rightImg from "@/images/about-hero-right.png";

export interface PageAboutProps {}

const PageAbout: FC<PageAboutProps> = () => {
  return (
    <div className="nc-PageAbout relative overflow-hidden">
      {/* Background Effects */}
      <BgGlassmorphism />

      {/* Main Content */}
      <div className="container mx-auto space-y-16 py-16 lg:space-y-28 lg:py-28">
        {/* Hero Section */}
        <SectionHero
          rightImg={rightImg}
          heading="Connecting Experts with Knowledge Seekers"
          btnText="Join Our Mission"
          subHeading={`At Nogl, we believe everyone deserves access to expert knowledge. We're solving the challenge of connecting people with trusted experts for personalized, one-on-one video sessions. Our platform makes it easy to find, book, and learn from industry leaders across technology, business, arts, and more.`}
        />

        {/* Founder Section */}
        <SectionFounder />

        {/* Statistics Section */}
        <div className="relative py-16">
          <SectionStatistic />
        </div>

        {/* Subscription Section */}
        <SectionSubscribe2 />
      </div>
    </div>
  );
};

export default PageAbout;
