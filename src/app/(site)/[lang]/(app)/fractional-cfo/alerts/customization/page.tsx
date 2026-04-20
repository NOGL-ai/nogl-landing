import { Settings01 as Settings } from '@untitledui/icons';

import { PlaceholderPage } from "../../_PlaceholderPage";

export const metadata = { title: "Alert customization — Fractional CFO | NOGL" };

export default function AlertCustomizationPage() {
    return (
        <PlaceholderPage
            title="Alert customization"
            description="Tune thresholds, channels, and schedules for every alert type."
            icon={<Settings className="h-5 w-5" />}
        />
    );
}
