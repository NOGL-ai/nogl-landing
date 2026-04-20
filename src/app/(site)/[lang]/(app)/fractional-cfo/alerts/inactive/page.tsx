import { Archive } from "lucide-react";
import { PlaceholderPage } from "../../_PlaceholderPage";

export const metadata = { title: "Inactive alerts — Fractional CFO | NOGL" };

export default function InactiveAlertsPage() {
    return (
        <PlaceholderPage
            title="Inactive alerts"
            description="Paused or resolved alerts, ready to reactivate when conditions change."
            icon={<Archive className="h-5 w-5" />}
        />
    );
}
