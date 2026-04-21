import type { ReactNode } from "react";

type ProfileLabeledCardProps = {
  label: string;
  children: ReactNode;
};

export function ProfileLabeledCard({ label, children }: ProfileLabeledCardProps) {
  return (
    <div className="rounded-lg border border-border-primary bg-bg-primary p-4">
      <p className="mb-2 text-sm font-medium text-text-secondary">{label}</p>
      {children}
    </div>
  );
}
