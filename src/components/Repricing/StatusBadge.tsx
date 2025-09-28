"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: "preview" | "enabled" | "disabled" | "completed";
  className?: string;
  withDot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
  withDot = true,
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case "preview":
        return {
          bg: "bg-state-success-lighter",
          text: "text-state-success-base",
          dot: "fill-state-success-base",
        };
      case "enabled":
        return {
          bg: "bg-state-success-lighter",
          text: "text-state-success-base", 
          dot: "fill-state-success-base",
        };
      case "completed":
        return {
          bg: "bg-state-success-lighter",
          text: "text-state-success-base",
          dot: "fill-state-success-base",
        };
      case "disabled":
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          dot: "fill-gray-400",
        };
      default:
        return {
          bg: "bg-state-success-lighter",
          text: "text-state-success-base",
          dot: "fill-state-success-base",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 px-2 py-1 rounded border-0",
        styles.bg,
        className
      )}
      style={{
        backgroundColor: status === "enabled" || status === "preview" || status === "completed" 
          ? "rgba(224, 250, 236, 1)" 
          : undefined,
        borderRadius: "4px",
        padding: "4px 8px 4px 4px",
      }}
    >
      {withDot && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
        >
          <circle
            cx="8"
            cy="8"
            r="3"
            fill={status === "enabled" || status === "preview" || status === "completed" 
              ? "#1FC16B" 
              : "#9CA3AF"}
          />
        </svg>
      )}
      <span
        className={cn(
          "text-xs font-medium leading-4",
          styles.text
        )}
        style={{
          color: status === "enabled" || status === "preview" || status === "completed" 
            ? "#1FC16B" 
            : "#6B7280",
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "12px",
          fontWeight: "500",
          lineHeight: "16px",
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

export default StatusBadge;
