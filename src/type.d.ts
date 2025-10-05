declare module "react-use-keypress";

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
