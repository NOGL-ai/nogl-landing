import { TwoCompanyCompareClient } from "@/components/analytics/compare/TwoCompanyCompareClient";

export const metadata = {
  title: "Compare companies | NOGL",
  description: "Side-by-side metrics for two tracked competitors. Use Competitive Compare for full multi-company analysis.",
};

export default function ComparePage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <TwoCompanyCompareClient />
    </div>
  );
}
