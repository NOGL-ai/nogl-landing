import Image, { StaticImageData } from "next/image";
import React, { FC, ReactNode } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

// Define featured leaders data
const FEATURED_EXPERTS = [
  {
    id: 1,
    name: "Viola Weller",
    designation: "Founder of VLACE",
    image: "/images/testimonial/Viola_Weller.jpg"
  },
  {
    id: 2,
    name: "Marie Luise Janknecht",
    designation: "Founder of Malunt",
    image: "/images/testimonial/Marie_Luise_Janknecht.jpeg"
  },
  {
    id: 3,
    name: "Naomi Lara Dirlewanger",
    designation: "Founder of Hera Organics",
    image: "/images/testimonial/Naomi_Lara_Dirlewanger.jpeg"
  },
  {
    id: 4,
    name: "Polina Sergeeva",
    designation: "Co-Founder of Menstruflow",
    image: "/images/testimonial/Polina_Sergeeva.jpeg"
  },
  {
    id: 5,
    name: "Madlin Kennedy",
    designation: "Founder of BREAZO",
    image: "/images/testimonial/Madlin_Kennedy.jpeg"
  },
  {
    id: 6,
    name: "Amy Jedlička",
    designation: "Co-Founder of MOLLY SUH",
    image: "/images/testimonial/Amy_Jedlicka.jpeg"
  }
];

export interface SectionHeroProps {
  className?: string;
  rightImg: StaticImageData;
  heading: ReactNode;
  subHeading: string;
  btnText: string;
  btnLink?: string;
  imgAlt?: string;
}

const SectionHero: FC<SectionHeroProps> = ({
  className = "",
  rightImg,
  heading,
  subHeading,
  btnText,
  btnLink = "/signup",
  imgAlt = "AI fashion forecasting platform",
}) => {
  return (
    <div className={`nc-SectionHero relative ${className}`}>
      <div className="relative flex flex-col-reverse items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        {/* Left Content */}
        <div className="max-w-2xl flex-shrink-0 space-y-8 lg:w-1/2 lg:space-y-10">
          <h1 className="text-3xl font-bold !leading-tight md:text-4xl xl:text-5xl">
            Transforming How Brands <br />
            <span className="text-primary-600">Forecast Trends & Predict Demand</span>
          </h1>
          
          <span className="block text-base sm:text-lg md:text-xl font-medium text-neutral-600 dark:text-neutral-400">
            {subHeading}
          </span>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <ButtonPrimary href={btnLink as any}>
              {btnText}
            </ButtonPrimary>
            <ButtonPrimary 
              href={"/" as any}
              className="bg-white text-primary-600 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
            >
              How It Works
            </ButtonPrimary>
          </div>

          {/* Trust Indicators with AnimatedTooltip */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <AnimatedTooltip items={FEATURED_EXPERTS} />
              </div>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Trusted by industry leaders
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐</span>
                <span>4.9/5 average rating</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>Secure platform</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Demand‑sensed insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative flex-1 lg:w-1/2">
          <Image
            className="w-full rounded-2xl object-cover shadow-xl"
            src={rightImg}
            alt={imgAlt}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          
          {/* Floating Stats Card */}
          <div className="absolute -left-8 bottom-8 hidden rounded-2xl bg-white p-4 shadow-2xl dark:bg-neutral-800 lg:block">
            <div className="text-sm font-medium">
              <div className="mb-2 text-2xl font-bold text-primary-600">+60% / +30% / +20%</div>
              <div className="text-neutral-500 dark:text-neutral-400">
                Velocity / Turns / Full‑price sell‑through
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionHero;
