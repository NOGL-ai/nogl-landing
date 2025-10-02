import { useEffect, useState } from "react";

type Breakpoint = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const breakpoints: Record<Breakpoint, number> = {
  xxs: 320,
  xs: 600,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
  "3xl": 2000,
};

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [breakpoint]);

  return matches;
}

export function useBreakpoints() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("xs");

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints["3xl"]) {
        setCurrentBreakpoint("3xl");
      } else if (width >= breakpoints["2xl"]) {
        setCurrentBreakpoint("2xl");
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint("xl");
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint("lg");
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint("md");
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint("sm");
      } else if (width >= breakpoints.xs) {
        setCurrentBreakpoint("xs");
      } else {
        setCurrentBreakpoint("xxs");
      }
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);

    return () => {
      window.removeEventListener("resize", updateBreakpoint);
    };
  }, []);

  return currentBreakpoint;
}
