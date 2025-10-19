"use client";
import { createContext, useContext, useRef, useCallback, useMemo, ReactNode } from "react";
import { usePathname } from "next/navigation";

interface ScreenContextValue {
  // Route info
  route: string;
  pageName: string;
  
  // Available data types on current page
  availableDataTypes: string[];
  
  // Methods (stable across renders)
  getData: (type: string) => any;
  setData: (type: string, data: any) => void;
}

const ScreenContext = createContext<ScreenContextValue | null>(null);

export function ScreenContextProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // ✅ Use ref for internal storage to prevent state change cascades
  const pageDataRef = useRef<Record<string, any>>({});
  
  // Map routes to page names (memoized for stability)
  const pageName = useMemo(() => getPageName(pathname), [pathname]);
  
  // Determine available data types based on route (memoized for stability)
  const availableDataTypes = useMemo(() => getAvailableDataTypes(pathname), [pathname]);
  
  // ✅ Stable callbacks with no state dependencies
  const getData = useCallback((type: string) => {
    return pageDataRef.current[type] || null;
  }, []); // No dependencies!
  
  const setData = useCallback((type: string, data: any) => {
    // Update ref without triggering re-renders
    pageDataRef.current = { ...pageDataRef.current, [type]: data };
  }, []); // No dependencies!
  
  // ✅ Context value only changes when route changes, not when data updates
  const value = useMemo(() => ({
    route: pathname,
    pageName,
    availableDataTypes,
    getData,
    setData,
  }), [pathname, pageName, availableDataTypes, getData, setData]);
  
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
