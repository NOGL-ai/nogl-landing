import { Bell } from "lucide-react";
import { PlaceholderPage } from "../_PlaceholderPage";

export const metadata = { title: "Alerts — Fractional CFO | NOGL" };

export default function AlertsPage() {
    return (
        <PlaceholderPage
            title="Alerts"
            description="Monitor pricing changes, stock-outs, and competitor moves in one inbox."
            icon={<Bell className="h-5 w-5" />}
        />
    );
}
