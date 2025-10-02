import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FeatureScrollProps {
  dictionary: any;
}

const FeatureScroll: React.FC<FeatureScrollProps> = ({ dictionary }) => {
  const features = [
    {
      title: "Demand Sensing",
      description: "Real-time analysis of consumer demand patterns and market signals to predict trending products.",
      icon: "/images/features/demand-sensing.svg",
    },
    {
      title: "Trend Forecasting", 
      description: "AI-powered predictions of upcoming fashion trends based on social media, runway shows, and market data.",
      icon: "/images/features/trend-forecasting.svg",
    },
    {
      title: "Assortment Optimization",
      description: "Intelligent recommendations for product mix and inventory planning to maximize sales potential.",
      icon: "/images/features/assortment-optimization.svg",
    },
    {
      title: "Price Intelligence",
      description: "Dynamic pricing insights and competitive analysis to optimize your pricing strategy.",
      icon: "/images/features/price-intelligence.svg",
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Fashion Intelligence
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover demand-sensed trends, predict new-product demand, and optimize assortments with our advanced AI platform.
          </p>
        </div>

        <div className="relative">
          {/* Scrolling container */}
          <div className="flex overflow-x-auto scrollbar-hide space-x-8 pb-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300",
                  "border border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureScroll;
