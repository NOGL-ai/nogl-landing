declare module "react-use-keypress";

// Static image imports — next-env.d.ts provides these during `next build/dev`,
// but tsc --noEmit runs before build so we declare them here for standalone type-checks.
declare module "*.png" {
  const content: import("next/image").StaticImageData;
  export default content;
}
declare module "*.jpg" {
  const content: import("next/image").StaticImageData;
  export default content;
}
declare module "*.jpeg" {
  const content: import("next/image").StaticImageData;
  export default content;
}
declare module "*.gif" {
  const content: import("next/image").StaticImageData;
  export default content;
}
declare module "*.webp" {
  const content: import("next/image").StaticImageData;
  export default content;
}
declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: string | Record<string, any>): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
}
