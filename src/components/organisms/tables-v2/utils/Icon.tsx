"use client";

import React from "react";
import { iconMapping } from "./icon-mapping";

interface IconProps {
  name: keyof typeof iconMapping;
  className?: string;
  "aria-hidden"?: boolean;
}

export function Icon({ name, className = "", "aria-hidden": ariaHidden }: IconProps) {
  const IconComponent = iconMapping[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon mapping`);
    return null;
  }

  return (
    <IconComponent 
      className={className} 
      aria-hidden={ariaHidden}
    />
  );
}
