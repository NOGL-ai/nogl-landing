import React from "react";
import { iconMap, IconName } from "./icon-mapping";

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
  [key: string]: any; // For other props like onClick, etc.
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className = "", 
  size = 16, 
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden = false,
  ...props 
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.error(`Icon "${name}" not found in icon mapping`);
    return (
      <div 
        className={`w-4 h-4 bg-red-500 rounded flex items-center justify-center text-white text-xs ${className}`}
        title={`Missing icon: ${name}`}
        aria-label={ariaLabel || `Missing icon: ${name}`}
        {...props}
      >
        !
      </div>
    );
  }

  return (
    <IconComponent 
      className={className} 
      style={{ width: size, height: size }}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      {...props}
    />
  );
};