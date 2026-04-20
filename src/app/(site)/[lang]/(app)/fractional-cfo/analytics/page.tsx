import { PieChart01 as PieChart } from '@untitledui/icons';

import { PlaceholderPage } from "../_PlaceholderPage";

export const metadata = { title: "Analytics — Fractional CFO | NOGL" };

export default function FinanceAnalyticsPage() {
    return (
        <PlaceholderPage
            title="Finance analytics"
            description="Margin, sell-through, and working-capital metrics across channels."
            icon={<PieChart className="h-5 w-5" />}
        />
    );
}
