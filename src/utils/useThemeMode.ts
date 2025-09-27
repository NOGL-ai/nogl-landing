import { useEffect, useState } from "react";
import { createGlobalState } from "react-hooks-global-state";

const initialState = { isDarkmode: true }; // Set default to true
const { useGlobalState } = createGlobalState(initialState);

export const useThemeMode = () => {
  const [isDarkMode, setIsDarkMode] = useGlobalState("isDarkmode");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Only access localStorage on client-side
    if (typeof window !== 'undefined') {
      // If there's no theme in localStorage, default to dark
      if (!localStorage.theme) {
        localStorage.theme = "dark";
      }

      if (localStorage.theme === "dark") {
        toDark();
      } else {
        toLight();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toDark = () => {
    setIsDarkMode(true);
    if (typeof window !== 'undefined') {
      const root = document.querySelector("html");
      if (!root) return;
      root.classList.add("dark");
      localStorage.theme = "dark";
    }
  };

  const toLight = () => {
    setIsDarkMode(false);
    if (typeof window !== 'undefined') {
      const root = document.querySelector("html");
      if (!root) return;
      root.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  function _toogleDarkMode() {
    if (typeof window !== 'undefined') {
      if (localStorage.theme === "light") {
        toDark();
      } else {
        toLight();
      }
    }
  }

  return {
    isDarkMode: mounted ? isDarkMode : true, // Return default value during SSR
    toDark,
    toLight,
    _toogleDarkMode,
  };
};
