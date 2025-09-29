import { Metadata } from "next";
import RepricingRules from "@/components/Repricing/RepricingRules";

export const metadata: Metadata = {
  title: "Auto Repricing Rules | Nogl",
  description: "Configure and manage your automated repricing rules",
  keywords: ["auto repricing", "pricing rules", "automated pricing", "dynamic pricing"],
  openGraph: {
    title: "Auto Repricing Rules | Nogl",
    description: "Configure and manage your automated repricing rules",
    type: "website",
  },
};

export default function AutoRepricingRulesPage() {
  return <RepricingRules />;
}
