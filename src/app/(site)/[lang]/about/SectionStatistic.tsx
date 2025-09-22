import React, { FC } from "react";
import Heading from "@/shared/Heading";

export interface Statistic {
  id: string;
  heading: string;
  subHeading: string;
  metric: string;
  icon: string;
}

const PLATFORM_STATS: Statistic[] = [
  {
    id: "1",
    heading: "Knowledge Shared",
    subHeading: "Hours of expert consultations delivered, helping professionals achieve their goals",
    metric: "10,000+",
    icon: "🎯"
  },
  {
    id: "2",
    heading: "Success Rate",
    subHeading: "Of our users report significant progress towards their learning objectives",
    metric: "94%",
    icon: "📈"
  },
  {
    id: "3",
    heading: "Expert Network",
    subHeading: "Verified industry leaders across technology, business, creative arts, and more",
    metric: "500+",
    icon: "🌟"
  },
  {
    id: "4",
    heading: "Global Reach",
    subHeading: "Countries represented in our community of experts and learners",
    metric: "40+",
    icon: "🌍"
  },
];

export interface SectionStatisticProps {
  className?: string;
}

const SectionStatistic: FC<SectionStatisticProps> = ({ className = "" }) => {
  return (
    <section className={`nc-SectionStatistic relative ${className}`}>
      <div className="container mx-auto px-4 py-16 lg:py-28">
        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Making an Impact Through Knowledge Sharing
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            Every day, we're helping professionals connect with experts who can transform their careers and businesses. 
            Here's what we've achieved together.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_STATS.map((stat) => (
            <div
              key={stat.id}
              className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-8 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl-dark"
            >
              {/* Background Accent */}
              <div className="absolute -right-2 -top-2 h-20 w-20 rounded-full bg-primary-50 dark:bg-primary-900 opacity-20" />
              
              {/* Icon */}
              <span className="text-3xl mb-4 block" role="img" aria-label={stat.heading}>
                {stat.icon}
              </span>

              {/* Metric */}
              <h3 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {stat.metric}
              </h3>

              {/* Heading */}
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {stat.heading}
              </h4>

              {/* Description */}
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {stat.subHeading}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Banner */}
        <div className="mt-16 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Trusted by professionals from leading companies worldwide
          </p>
          <div className="mt-6 flex justify-center space-x-8 opacity-75 grayscale">
            {/* Add company logos here */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionStatistic;
