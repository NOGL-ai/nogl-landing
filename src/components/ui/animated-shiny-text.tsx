import { CSSProperties, FC, ReactNode } from "react";

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
  return (
    <p
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",

        // Optimized shine effect with reduced animation complexity
        "animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%] [transition:background-position_2s_ease-in-out_infinite] [will-change:background-position]",

        // Simplified shine gradient
        "bg-gradient-to-r from-transparent via-black/60 via-50% to-transparent dark:via-white/60",

        className,
      )}
    >
      {children}
    </p>
  );
};

export default AnimatedShinyText;
