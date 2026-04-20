import type { MDXComponents } from 'mdx/types';

/**
 * Allowed MDX components.
 * Only expose a safe whitelist — do NOT pass the full shadcn kit here.
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    // Block-level callout
    Callout: ({ children, type = 'info' }: { children: React.ReactNode; type?: string }) => {
      const styles = {
        info: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300',
        warning: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300',
        error: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 text-red-800 dark:text-red-300',
        success: 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40 text-green-800 dark:text-green-300',
      };
      return (
        <div className={`my-4 rounded-lg border px-4 py-3 text-sm ${styles[type as keyof typeof styles] ?? styles.info}`}>
          {children}
        </div>
      );
    },

    // Numbered steps container
    Steps: ({ children }: { children: React.ReactNode }) => (
      <ol className="my-4 ml-4 space-y-3 list-decimal marker:text-primary">
        {children}
      </ol>
    ),

    // Tabbed content
    Tabs: ({ children, items }: { children: React.ReactNode; items: string[] }) => (
      <div className="my-4 rounded-lg border border-border overflow-hidden">
        {children}
      </div>
    ),

    ...components,
  };
}
