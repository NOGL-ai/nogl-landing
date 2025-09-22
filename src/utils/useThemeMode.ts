import { useEffect } from "react";
import { createGlobalState } from "react-hooks-global-state";

const initialState = { isDarkmode: true }; // Set default to true
const { useGlobalState } = createGlobalState(initialState);

export const useThemeMode = () => {
  const [isDarkMode, setIsDarkMode] = useGlobalState("isDarkmode");

  useEffect(() => {
    // If there's no theme in localStorage, default to dark
    if (!localStorage.theme) {
      localStorage.theme = "dark";
    }

    if (localStorage.theme === "dark") {
      toDark();
    } else {
      toLight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toDark = () => {
    setIsDarkMode(true);
    const root = document.querySelector("html");
    if (!root) return;
    root.classList.add("dark");
    localStorage.theme = "dark";
  };

  const toLight = () => {
    setIsDarkMode(false);
    const root = document.querySelector("html");
    if (!root) return;
    root.classList.remove("dark");
    localStorage.theme = "light";
  };

  function _toogleDarkMode() {
    if (localStorage.theme === "light") {
      toDark();
    } else {
      toLight();
    }
  }

  return {
    isDarkMode,
    toDark,
    toLight,
    _toogleDarkMode,
  };
};
