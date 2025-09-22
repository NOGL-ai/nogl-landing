"use client"

import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import FlipText from "@/components/ui/flip-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface HeroProps {
  dictionary: {
    hero: {
      introducing: string;
      title: string[];
      description: string;
      buttonText: string;
    }
  }
}

export default function HeroSection({ dictionary }: HeroProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  if (!dictionary?.hero) {
    return null;
  }

  const scrollToNewsletter = () => {
    const newsletterElement = document.getElementById('newsletter');
    newsletterElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const titleLines = Array.isArray(dictionary.hero.title) 
    ? dictionary.hero.title 
    : [dictionary.hero.title];

  return (
    <section
      id="hero"
      className="relative mx-auto mt-32 max-w-[80rem] px-6 text-center md:px-8"
    >
      <div className="backdrop-filter-[12px] inline-flex h-7 items-center justify-between rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white dark:text-black transition-all ease-in hover:cursor-pointer hover:bg-white/20 group gap-1 translate-y-[-1rem] animate-fade-in opacity-0">
        <AnimatedShinyText className="inline-flex items-center justify-center">
          <span>✨ {dictionary.hero.introducing}</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
      </div>
      <div className="mt-12 space-y-4">
        {titleLines.map((line, index) => (
          <h1 key={index} className="block">
            <FlipText 
              word={line}
              duration={0.4}
              staggerDelay={0.1}
              className="bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text text-base font-medium text-transparent xsm:text-base lsm:text-lg sm:text-xl md:text-3xl lg:text-5xl xl:text-6xl lg:leading-[1.2] py-2 inline-block"
            />
          </h1>
        ))}
      </div>
      <motion.p 
        className="mt-16 mb-16 text-base tracking-tight text-gray-400 md:text-lg text-balance"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: 1.2, // After title animations complete
          ease: "easeOut" 
        }}
        style={{ willChange: "transform, opacity" }}
      >
        {dictionary.hero.description}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: 1.5, // After description
          ease: "easeOut" 
        }}
        style={{ willChange: "transform, opacity" }}
      >
        <RainbowButton 
          onClick={scrollToNewsletter}
          className="gap-1 rounded-lg text-white dark:text-black"
        >
          {dictionary.hero.buttonText}
          <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
        </RainbowButton>
      </motion.div>
    </section>
  );
}
