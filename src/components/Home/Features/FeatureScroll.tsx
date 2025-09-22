"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, MotionValue, easeOut } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuroraText } from "@/components/ui/aurora-text";
import Link from "next/link";
import type { Route } from "next";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ArrowRightIcon } from "@radix-ui/react-icons";

type CardDataProps = {
  id: number;
  title: string;
  content: string;
  video?: string;
  thumbnail: string;
  url: string;
};

const CARD_HEIGHT = 800;

type CardProps = {
  position: number;
  card: CardDataProps;
  scrollYProgress: MotionValue<number>;
  dictionary: {
    features?: {
      learnMore?: string;
    };
  };
  totalCards: number;
};

const arePropsEqual = (prevProps: CardProps, nextProps: CardProps) => {
  return (
    prevProps.position === nextProps.position &&
    prevProps.card.id === nextProps.card.id &&
    prevProps.totalCards === nextProps.totalCards &&
    prevProps.dictionary.features?.learnMore === nextProps.dictionary.features?.learnMore
  );
};

const Card = React.memo(({ position, card, scrollYProgress, dictionary, totalCards }: CardProps) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const isOddCard = position % 2;
  
  const stackY = useTransform(
    scrollYProgress,
    [Math.max(0, (position - 1.5) / totalCards), position / totalCards],
    ["100%", "0%"],
    { ease: easeOut }
  );
  
  const flyAwayY = useTransform(
    scrollYProgress,
    [0.8, 1],
    ["0%", "-100%"],
    { ease: easeOut }
  );
  
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, (position - 1.5) / totalCards), (position - 1) / totalCards],
    [0, 1],
    { ease: easeOut }
  );
  
  const visibility = useTransform(
    scrollYProgress,
    [
      Math.max(0, (position - 2) / totalCards),
      (position - 1.5) / totalCards,
      position / totalCards,
      Math.min(1, (position + 0.5) / totalCards)
    ],
    ["hidden", "visible", "visible", "hidden"]
  );
  
  const y = useTransform(
    [stackY, flyAwayY] as const,
    (latest: string[]) => `calc(${latest[0]} + ${latest[1]})`
  );
  
  return (
    <motion.div
      role="region"
      aria-label={`Feature: ${card.title}`}
      style={{
        height: CARD_HEIGHT,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        y,
        opacity,
        visibility,
        pointerEvents: scrollYProgress.get() === 0 ? 'none' : 'auto',
        zIndex: position,
        background: isOddCard ? "#4F46E5" : "white",
      }}
      className="flex w-full origin-top flex-col items-center justify-center px-4 md:px-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-[0.6fr,1.4fr] gap-12 md:gap-0 w-full max-w-[1400px] mx-auto">
        <div className={cn(
          "flex flex-col justify-center px-4 md:px-4 lg:px-8 text-center md:text-left",
          isOddCard ? "text-white" : "text-black"
        )}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6 md:space-y-4"
          >
            <h3 className="text-3xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              {card.title}
            </h3>
            <p className="text-base md:text-base lg:text-lg opacity-80 leading-relaxed max-w-xl mx-auto md:mx-0">
              {card.content}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 md:mt-4"
          >
            <a
              href={card.url}
              className={cn(
                "inline-flex items-center gap-2 text-lg font-medium group hover:opacity-80 transition-opacity",
                isOddCard ? "text-white" : "text-black"
              )}
            >
              <span className="border-b-2 border-transparent group-hover:border-current transition-all duration-300">
                {dictionary.features?.learnMore || "Learn more"}
              </span>
              <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1.5 transition-transform duration-300" />
            </a>
          </motion.div>
        </div>

        <div className="relative h-full flex items-center justify-center p-4 md:p-0 -mt-8">
          <motion.div 
            className="w-full max-w-[600px] md:max-w-none aspect-[16/10] relative rounded-xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {!isVideoLoaded && !videoError && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />
            )}
            {!videoError ? (
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={card.thumbnail}
                src={card.video}
                onLoadedData={() => setIsVideoLoaded(true)}
                onError={() => setVideoError(true)}
                aria-label={`Demo video for ${card.title}`}
              />
            ) : (
              <img 
                src={card.thumbnail} 
                alt={`${card.title} feature`}
                className="h-full w-full object-cover"
              />
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}, arePropsEqual);

Card.displayName = 'Card';

type FeatureScrollProps = {
  dictionary: {
    features?: {
      title?: string;
      description?: string;
      learnMore?: string;
      cards?: CardDataProps[];
    };
  };
};

export function FeatureScroll({ dictionary }: FeatureScrollProps) {
  const cardData = dictionary.features?.cards || [];
  
  return (
    <section className="relative">
      <div className="container mx-auto px-4">
        <div className="text-center py-12 space-y-4">
          <AuroraText 
            as="h2"
            className="text-4xl md:text-5xl lg:text-6xl font-bold [--color-1:120_100%_50%] [--color-2:200_100%_50%] [--color-3:120_100%_50%] [--color-4:200_100%_50%]"
          >
            {dictionary.features?.title || "AI-Powered Communication"}
          </AuroraText>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {dictionary.features?.description || "Break language barriers with real-time AI translation and voice cloning"}
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <RainbowButton 
              className="translate-y-[-1rem] animate-fade-in gap-1 rounded-lg text-white dark:text-black opacity-0 ease-in-out [--animation-delay:600ms]"
            >
              <span>{dictionary.features?.learnMore || "Explore Features"}</span>
              <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
            </RainbowButton>
          </div>
        </div>
      </div>
      <Feature cardData={cardData} dictionary={dictionary} />
    </section>
  );
}

const Feature = ({ cardData, dictionary }: { cardData: CardDataProps[], dictionary: FeatureScrollProps['dictionary'] }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <div className="relative w-full">
      <div 
        ref={containerRef} 
        className="relative w-full"
        style={{
          height: CARD_HEIGHT * cardData.length,
        }}
      >
        {cardData.map((card, idx) => (
          <Card
            key={card.id}
            card={card}
            scrollYProgress={scrollYProgress}
            position={idx + 1}
            dictionary={dictionary}
            totalCards={cardData.length}
          />
        ))}
      </div>
    </div>
  );
}; 