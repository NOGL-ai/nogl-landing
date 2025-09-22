"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { IconType } from "react-icons";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiSearch,
  FiAlertTriangle,
} from "react-icons/fi";

interface ProblemProps {
  dictionary: {
    problem: {
      title: string;
      subtitle: string;
      description: string;
      challenges: {
        title: string;
        description: string;
      }[];
    };
  };
}

const icons = [FiDollarSign, FiSearch, FiAlertTriangle];

interface FeatureProps {
  position: number;
  index: number;
  title: string;
  description: string;
  Icon: IconType;
}

const Feature = ({
  position,
  index,
  title,
  description,
  Icon,
}: FeatureProps) => {
  const translateAmt = position * -100;

  const cardStyles = [
    "bg-gradient-to-br from-black to-neutral-900 text-white relative group",
    "bg-gradient-to-br from-white to-neutral-50 text-black relative group",
    "bg-gradient-to-br from-black to-neutral-900 text-white relative group",
  ];

  return (
    <motion.div
      animate={{ x: `${translateAmt}%` }}
      transition={{
        ease: "easeInOut",
        duration: 0.35,
      }}
      className={`relative flex min-h-[250px] w-full max-w-lg shrink-0 flex-col justify-between overflow-hidden p-8 shadow-lg ${
        cardStyles[index % cardStyles.length]
      }`}
    >
      <div className="absolute inset-0 overflow-visible [container-type:size]">
        <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide">
          <div className="absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,rgba(255,255,255,0.05)_var(--spread),transparent_var(--spread))]" 
               style={{ "--spread": "90deg" } as React.CSSProperties} />
        </div>
      </div>

      <Icon className="relative z-10 absolute right-2 top-2 text-7xl opacity-10" />
      <h3 className="relative z-10 mb-8 text-3xl font-bold">{title}</h3>
      <p className="relative z-10 text-lg opacity-90">{description}</p>
    </motion.div>
  );
};

const CollapseCardFeatures = ({ dictionary }: ProblemProps) => {
  const [position, setPosition] = useState(0);

  if (!dictionary?.problem) {
    return null;
  }

  const features = dictionary.problem.challenges.map((challenge, index) => ({
    title: challenge.title,
    Icon: icons[index],
    description: challenge.description,
  }));

  const shiftLeft = () => {
    if (position > 0) {
      setPosition((pv) => pv - 1);
    }
  };

  const shiftRight = () => {
    if (position < features.length - 1) {
      setPosition((pv) => pv + 1);
    }
  };

  return (
    <section className="overflow-hidden px-4 py-12 pt-48">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.2]">
            {dictionary.problem.title}{" "}
            <span className="text-neutral-400">{dictionary.problem.subtitle}</span>
          </h2>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={shiftLeft}
              disabled={position === 0}
              className={`h-fit p-4 text-2xl transition-colors ${
                position === 0
                  ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-neutral-700"
              }`}
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              onClick={shiftRight}
              disabled={position === features.length - 1}
              className={`h-fit p-4 text-2xl transition-colors ${
                position === features.length - 1
                  ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-neutral-700"
              }`}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          {features.map((feat, index) => (
            <Feature {...feat} key={index} position={position} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollapseCardFeatures;