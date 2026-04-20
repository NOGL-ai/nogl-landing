import { BookOpen } from "lucide-react";
import { PlaceholderPage } from "../_PlaceholderPage";

export const metadata = { title: "Docs — Fractional CFO | NOGL" };

export default function FinanceDocsPage() {
    return (
        <PlaceholderPage
            title="Docs"
            description="Guides for forecasting, replenishment, and data imports."
            icon={<BookOpen className="h-5 w-5" />}
        />
    );
}
