import { BellRing } from "lucide-react";
import { PlaceholderPage } from "../../_PlaceholderPage";

export const metadata = { title: "Notifications — Fractional CFO | NOGL" };

export default function AlertNotificationsPage() {
    return (
        <PlaceholderPage
            title="Notifications"
            description="Recent alert deliveries, grouped by channel and status."
            icon={<BellRing className="h-5 w-5" />}
        />
    );
}
