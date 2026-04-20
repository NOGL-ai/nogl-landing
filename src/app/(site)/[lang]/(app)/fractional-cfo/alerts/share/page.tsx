import { Share01 as Share2 } from '@untitledui/icons';

import { PlaceholderPage } from "../../_PlaceholderPage";

export const metadata = { title: "Share alerts — Fractional CFO | NOGL" };

export default function ShareAlertsPage() {
    return (
        <PlaceholderPage
            title="Share alerts"
            description="Route alerts to Slack, email, or webhooks — per team or per product."
            icon={<Share2 className="h-5 w-5" />}
        />
    );
}
