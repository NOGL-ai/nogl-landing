import { CompareClient } from "@/components/analytics/compare/CompareClient";

export const metadata = {
  title: "Multi-Company Analysis | NOGL",
  description: "Data-informed price strategy, opportunities, and development across multiple companies.",
};

export default function ComparePage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <CompareClient />
    </div>
  );
}
