import Label from "@/components/Label";
import React, { ReactNode } from "react";
import { FC } from "react";

export interface FormItemProps {
  className?: string;
  label?: ReactNode;
  desc?: string;
  error?: string;
  children?: React.ReactNode;
  comingSoon?: boolean;
  dictionary: {
    common: {
      comingSoon: string;
    };
  };
}

const FormItem: FC<FormItemProps> = ({
  children,
  className = "",
  label,
  desc,
  error,
  comingSoon,
  dictionary,
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && typeof label === "string" ? (
        <Label>{label}</Label>
      ) : (
        label
      )}
      <div className="mt-1">{children}</div>
      {desc && (
        <span className="block mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          {desc}
        </span>
      )}
      {error && (
        <span className="block mt-2 text-xs text-red-500">
          {error}
        </span>
      )}
      {comingSoon && (
        <span className="block mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          {dictionary.common.comingSoon}
        </span>
      )}
    </div>
  );
};

export default FormItem; 