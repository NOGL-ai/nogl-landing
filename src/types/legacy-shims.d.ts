declare module "@/hooks/use-breakpoint" {
  export const useBreakpoint: (...args: unknown[]) => boolean;
  const _default: (...args: unknown[]) => boolean;
  export default _default;
}

declare module "@/components/shared-assets/background-patterns" {
  import type { ComponentType } from "react";

  export type BackgroundPatternProps = {
    pattern?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
  };
  export const BackgroundPattern: ComponentType<BackgroundPatternProps>;
  export const GridPattern: ComponentType<any>;
  export const DotPattern: ComponentType<any>;
  const _default: ComponentType<any>;
  export default _default;
}

declare module "@/components/shared-assets/illustrations" {
  import type { ComponentType } from "react";

  export const Illustration: ComponentType<any>;
  export const EmptyStateIllustration: ComponentType<any>;
  const _default: ComponentType<any>;
  export default _default;
}

declare module "embla-carousel-react" {
  export type UseEmblaCarouselType = [
    (element: HTMLElement | null) => void,
    {
      scrollPrev: () => void;
      scrollNext: () => void;
      canScrollPrev: () => boolean;
      canScrollNext: () => boolean;
      selectedScrollSnap: () => number;
      scrollSnapList: () => number[];
      on: (...args: unknown[]) => void;
      off: (...args: unknown[]) => void;
      scrollTo: (index: number) => void;
    } | null
  ];
  type EmblaHook = (...args: unknown[]) => UseEmblaCarouselType;
  const useEmblaCarousel: EmblaHook;
  export default useEmblaCarousel;
}

declare module "recharts/types/component/DefaultLegendContent" {
  export type Props = {
    payload?: Array<{ value?: string; payload?: Record<string, unknown> }>;
    align?: "left" | "center" | "right";
    layout?: "horizontal" | "vertical";
  };
}

declare module "recharts/types/component/DefaultTooltipContent" {
  export type NameType = string | number;
  export type ValueType = string | number;
}

declare module "recharts/types/shape/Dot" {
  export type Props = {
    cx?: number;
    cy?: number;
  };
}

declare module "input-otp";

declare module "@/components/foundations/payment-icons" {
  import type { ComponentType, SVGProps } from "react";

  type IconType = ComponentType<SVGProps<SVGSVGElement>>;
  export const VisaIcon: IconType;
  export const MastercardIcon: IconType;
  export const AmexIcon: IconType;
  export const DiscoverIcon: IconType;
  export const UnionPayIcon: IconType;
}
