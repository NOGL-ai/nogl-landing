"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { CSSProperties, FC, ReactNode } from "react";
import { useAnimationCapabilities, getAnimationVariants, getStaggerTiming } from "@/hooks/useAnimationCapabilities";

import { cn } from "@/lib/utils";

interface AnimatedShinyTextProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
}

const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
}) => {
  const { animationLevel, hasGPU } = useAnimationCapabilities();
  
  // Convert children to string and split into words
  const extractTextFromChildren = (children: ReactNode): string => {
    return React.Children.toArray(children)
      .map(child => {
        if (typeof child === 'string') return child;
        if (typeof child === 'number') return child.toString();
        if (React.isValidElement(child)) {
          // Recursively extract text from nested elements
          return extractTextFromChildren(child.props.children);
        }
        return '';
      })
      .join('');
  };

  const text = typeof children === 'string' ? children : extractTextFromChildren(children);
  const words = text.split(' ');

  // Get adaptive animation variants
  const wordVariants = getAnimationVariants(animationLevel);
  const staggerTiming = getStaggerTiming(animationLevel);

  // Container variants that adapt to device capabilities
  const containerVariants: Variants = {
    hidden: { opacity: animationLevel === 'none' ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: staggerTiming,
    },
  };

  // For devices without animations or very low-end
  if (animationLevel === 'none') {
    return (
      <p className={cn(
        "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",
        className,
      )}>
        {text}
      </p>
    );
  }

  // For CPU-only devices, disable shine effect
  const shouldUseShine = hasGPU && (animationLevel === 'full' || animationLevel === 'reduced');

  return (
    <motion.p
      style={
        shouldUseShine ? {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties : undefined
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
            // Apply shine effect only for capable devices
            shouldUseShine && [
              "bg-clip-text bg-gradient-to-r from-transparent via-black/60 via-50% to-transparent dark:via-white/60",
              "animate-shiny-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%]"
            ]
          )}
          style={{ 
            willChange: shouldUseShine 
              ? "transform, opacity, background-position" 
              : animationLevel === 'minimal' 
                ? "opacity" 
                : "transform, opacity" 
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
};

export default AnimatedShinyText;
