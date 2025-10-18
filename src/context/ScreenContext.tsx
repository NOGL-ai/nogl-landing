"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { usePathname } from "next/navigation";

interface ScreenContextValue {
  // Route info
  route: string;
  pageName: string;
  
  // Available data types on current page
  availableDataTypes: string[];
  
  // Current page data
  pageData: Record<string, any>;
  
  // Methods
  getData: (type: string) => any;
  setData: (type: string, data: any) => void;
}

const ScreenContext = createContext<ScreenContextValue | null>(null);

export function ScreenContextProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pageData, setPageData] = useState<Record<string, any>>({});
  
  // Map routes to page names
  const pageName = getPageName(pathname);
  
  // Determine available data types based on route
  const availableDataTypes = getAvailableDataTypes(pathname);
  
  const getData = useCallback((type: string) => {
    return pageData[type] || null;
  }, [pageData]);
  
  const setData = useCallback((type: string, data: any) => {
    setPageData(prev => ({ ...prev, [type]: data }));
  }, []);
  
  const value = {
    route: pathname,
    pageName,
    availableDataTypes,
    pageData,
    getData,
    setData,
  };
  
  return (
    <ScreenContext.Provider value={value}>
      {children}
    </ScreenContext.Provider>
  );
}

export const useScreenContext = () => {
  const ctx = useContext(ScreenContext);
  if (!ctx) throw new Error("useScreenContext must be within ScreenContextProvider");
  return ctx;
};

// Helper functions
function getPageName(pathname: string): string {
  if (pathname.includes('/pricing')) return 'Pricing Page';
  if (pathname.includes('/competitors')) return 'Competitors Page';
  if (pathname.includes('/dashboard')) return 'Dashboard';
  if (pathname.includes('/blog')) return 'Blog';
  if (pathname.includes('/about')) return 'About Page';
  return 'Home';
}

function getAvailableDataTypes(pathname: string): string[] {
  if (pathname.includes('/pricing')) return ['pricing'];
  if (pathname.includes('/competitors')) return ['competitors'];
  if (pathname.includes('/dashboard')) return ['pricing', 'competitors'];
  return [];
}
