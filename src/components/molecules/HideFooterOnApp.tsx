"use client";

import { useEffect } from "react";

export default function HideFooterOnApp() {
  useEffect(() => {
    document.body.classList.add("app-hide-footer");
    return () => {
      document.body.classList.remove("app-hide-footer");
    };
  }, []);
  return null;
}
