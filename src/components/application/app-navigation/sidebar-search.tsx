"use client";

import React, { useState, useRef, useEffect } from "react";
import { SearchMd } from "@untitledui/icons";

interface SidebarSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  theme?: 'light' | 'dark';
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({
  placeholder = "Search",
  onSearch,
  className = "",
  theme = 'dark',
}) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  const isDarkMode = theme === "dark";

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`w-full ${className}`}>
        <div className={"border rounded-[8px] w-full bg-white border-[#d5d7da] dark:bg-[#0a0d12] dark:border-[#414651]"}>
          <div className="flex gap-2 items-center px-3 py-2 w-full">
            <div className="flex flex-1 gap-2 items-center min-h-0 min-w-0">
              <div className="shrink-0 w-5 h-5">
                <SearchMd className="w-5 h-5 text-[#a4a7ae] dark:text-[#717680]" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 bg-transparent border-none outline-none text-base font-normal leading-6 min-h-0 min-w-0 overflow-ellipsis whitespace-nowrap text-[#717680] placeholder:text-[#717680]"
              />
            </div>
            <div className="border rounded px-1 py-0.5 shrink-0 border-[#e9eaeb] mix-blend-multiply dark:border-[#252b37]">
              <span className="text-xs font-medium leading-[18px] text-[#a4a7ae] dark:text-[#717680]">
                ⌘K
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={"border rounded-[8px] w-full bg-white border-[#d5d7da] dark:bg-[#0a0d12] dark:border-[#414651]"}>
        <div className="flex gap-2 items-center px-3 py-2 w-full">
          <div className="flex flex-1 gap-2 items-center min-h-0 min-w-0">
            <div className="shrink-0 w-5 h-5">
              <SearchMd className="w-5 h-5 text-[#a4a7ae] dark:text-[#717680]" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none outline-none text-base font-normal leading-6 min-h-0 min-w-0 overflow-ellipsis whitespace-nowrap text-[#717680] placeholder:text-[#717680]"
            />
          </div>
          <div className="border rounded px-1 py-0.5 shrink-0 border-[#e9eaeb] mix-blend-multiply dark:border-[#252b37]">
            <span className="text-xs font-medium leading-[18px] text-[#a4a7ae] dark:text-[#717680]">
              ⌘K
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
