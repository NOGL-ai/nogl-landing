"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onChange,
  disabled = false,
  className = "",
}) => {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      className={cn(
        "relative w-8 h-5 transition-colors duration-200 ease-in-out rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      role="switch"
      aria-checked={checked}
    >
      {/* Background track */}
      <div
        className={cn(
          "absolute left-0.5 top-0.5 w-7 h-4 rounded-full border-t transition-colors duration-200",
          checked
            ? "bg-primary-base border-primary-dark"
            : "bg-stroke-soft-200 border-neutral-300"
        )}
        style={{
          backgroundColor: checked ? "#375DFB" : "#E2E4E9",
          borderTopColor: checked ? "#253EA7" : "#CDD0D5",
          boxShadow: checked 
            ? "inset 0 4px 4px 0 rgba(15, 15, 16, 0.12)" 
            : "inset 0 4px 4px 0 rgba(15, 15, 16, 0.06)"
        }}
      />
      
      {/* Toggle circle */}
      <div
        className={cn(
          "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out",
          "border-r border-b border-l border-white",
          checked ? "translate-x-4" : "translate-x-1"
        )}
        style={{
          boxShadow: checked
            ? "inset 0 -3px 3px 0 #E4E5E7, 0 6px 10px 0 rgba(22, 38, 100, 0.08), 0 4px 8px 0 rgba(22, 38, 100, 0.08), 0 2px 4px 0 rgba(22, 38, 100, 0.08)"
            : "inset 0 -3px 3px 0 rgba(228, 229, 231, 0.48), 0 6px 10px 0 rgba(27, 28, 29, 0.06), 0 2px 4px 0 rgba(27, 28, 29, 0.02)"
        }}
      >
        {/* Small indicator dot */}
        <div
          className={cn(
            "absolute top-1 left-1 w-1 h-1 rounded-full transition-colors duration-200",
            checked ? "bg-primary-base" : "bg-stroke-soft-200"
          )}
          style={{
            backgroundColor: checked ? "#375DFB" : "#E2E4E9",
            boxShadow: "0 2px 4px 0 rgba(27, 28, 29, 0.04)"
          }}
        />
      </div>
    </button>
  );
};

export default Toggle;
