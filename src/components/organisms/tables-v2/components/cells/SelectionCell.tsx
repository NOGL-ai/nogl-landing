"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectionCheckboxProps } from "../../core/types";

export function SelectionCell({
  checked,
  onCheckedChange,
  ariaLabel,
  indeterminate = false,
  disabled = false,
}: SelectionCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={ariaLabel}
      aria-describedby={indeterminate ? "indeterminate-state" : undefined}
      disabled={disabled}
      className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    />
  );
}
