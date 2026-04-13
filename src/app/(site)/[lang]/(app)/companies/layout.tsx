import type { ReactNode } from "react";

import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";

export default function CompaniesLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <DashboardTopBar />
      {children}
    </main>
  );
}
