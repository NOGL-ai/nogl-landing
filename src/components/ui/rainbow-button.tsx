"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

import { cn } from "@/lib/utils";

interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

// Container variants for button text animation
const buttonContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06, // Fast stagger for button text
      delayChildren: 0.1,
    },
  },
};

// Individual word variants for button text
const buttonWordVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 5,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

export function RainbowButton({
  children,
  className,
  ...props
}: RainbowButtonProps) {
  // Extract text from children for word-by-word animation
  const text = typeof children === 'string' ? children : 
    React.Children.toArray(children)
      .filter(child => typeof child === 'string')
      .join(' ');
  
  const words = text.split(' ').filter(word => word.length > 0);
  const nonTextChildren = React.Children.toArray(children)
    .filter(child => typeof child !== 'string');

  return (
    <motion.button
      className={cn(
        "group relative inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-primary-foreground transition-all duration-300 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",

        // Optimized before styles with reduced blur and simpler animation
        "before:absolute before:bottom-[-10%] before:left-1/2 before:z-0 before:h-1/6 before:w-2/5 before:-translate-x-1/2 before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.4*1rem))] before:[will-change:transform] before:transition-transform before:duration-300",

        // Simplified light mode colors
        "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.4)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // Simplified dark mode colors
        "dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.4)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // Hover effects
        "hover:before:scale-110",

        className,
      )}
      variants={buttonContainerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ willChange: "transform, opacity" }}
      {...props}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={buttonWordVariants}
          className="inline-block mr-1 last:mr-0"
          style={{ willChange: "transform, opacity" }}
        >
          {word}
        </motion.span>
      ))}
      {nonTextChildren}
    </motion.button>
  );
}
