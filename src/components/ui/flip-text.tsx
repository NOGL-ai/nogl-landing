"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlipTextProps {
  word: string;
  duration?: number;
  staggerDelay?: number;
  className?: string;
}

// Container variants for staggered animation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Delay between each word
      delayChildren: 0.1,   // Initial delay before first word
    },
  },
};

// Individual word variants
const wordVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.8
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function FlipText({
  word,
  duration = 0.4,
  staggerDelay = 0.1,
  className,
}: FlipTextProps) {
  // Split by words instead of characters for better performance
  const words = word.split(" ");

  return (
    <motion.span 
      className={cn("inline-block", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ willChange: "opacity" }}
    >
      {words.map((wordText, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          className="inline-block mr-2 last:mr-0"
          style={{ willChange: "transform, opacity" }}
        >
          {wordText}
        </motion.span>
      ))}
    </motion.span>
  );
}
