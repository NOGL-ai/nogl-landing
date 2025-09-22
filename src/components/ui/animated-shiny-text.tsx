"use client";

import { motion, Variants } from "framer-motion";
import { CSSProperties, FC, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AnimatedShinyTextProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
}

// Container variants for sequential word animation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Faster stagger for shorter text
      delayChildren: 0.05,
    },
  },
};

// Individual word variants with shine effect
const wordVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
}) => {
  // Convert children to string and split into words
  const text = typeof children === 'string' ? children : children?.toString() || '';
  const words = text.split(' ');

  return (
    <motion.p
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",
        className,
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          className={cn(
            "inline-block mr-1 last:mr-0",
            // Apply shine effect to each word
            "bg-clip-text bg-gradient-to-r from-transparent via-black/60 via-50% to-transparent dark:via-white/60",
            "animate-shiny-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%] [will-change:background-position]"
          )}
          style={{ willChange: "transform, opacity, background-position" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
};

export default AnimatedShinyText;
