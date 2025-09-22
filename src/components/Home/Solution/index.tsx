"use client";

import Safari from "@/components/ui/safari";
import Section from "@/components/section";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SolutionProps {
  dictionary: {
    solution: {
      title: string;
      subtitle: string;
      description: string;
      features: {
        title: string;
        description: string;
      }[];
    };
  };
}

const extraClasses = [
  "hover:bg-red-500/10",
  "order-3 xl:order-none hover:bg-blue-500/10",
  "md:row-span-2 hover:bg-orange-500/10",
  "flex-row order-4 md:col-span-2 md:flex-row xl:order-none hover:bg-green-500/10",
];

const images = [
  "/images/solution/group_sessions.png",
  "/images/solution/expert.png",
  "/images/solution/aichats.png",
  "/images/solution/solution_4.png",
];

export default function Component({ dictionary }: SolutionProps) {
  if (!dictionary?.solution) {
    return null;
  }

  const features = dictionary.solution.features.map((feature, index) => ({
    title: feature.title,
    description: feature.description,
    className: `${extraClasses[index]} transition-all duration-500 ease-out`,
    content: (
      <>
        <Safari
          src={images[index]}
          url="https://www.nogl.ai/"
          className={index === 2 
            ? "-mb-48 ml-12 mt-16 h-full px-4 select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-x-[-10px] transition-all duration-300"
            : "-mb-32 mt-4 max-h-64 w-full px-4 select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-y-[-10px] transition-all duration-300"
          }
        />
      </>
    ),
  }));

  return (
    <Section
      title={dictionary.solution.title}
      subtitle={dictionary.solution.subtitle}
      description={dictionary.solution.description}
      className="bg-neutral-100 dark:bg-neutral-900"
    >
      <div className="mx-auto mt-16 grid max-w-sm grid-cols-1 gap-6 text-gray-500 md:max-w-3xl md:grid-cols-2 xl:grid-rows-2 md:grid-rows-3 xl:max-w-6xl xl:auto-rows-fr xl:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className={cn(
              "group relative items-start overflow-hidden bg-neutral-50 dark:bg-neutral-800 p-6 rounded-2xl",
              feature.className
            )}
          >
            <div>
              <h3 className="font-semibold mb-2 text-primary">
                {feature.title}
              </h3>
              <p className="text-foreground">{feature.description}</p>
            </div>
            {feature.content}
            <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900 pointer-events-none"></div>
          </div>
        ))}
      </div>
    </Section>
  );
}
