import { Cube04 as Boxes } from '@untitledui/icons';

import { PlaceholderPage } from "../_PlaceholderPage";

export const metadata = { title: "Replenishment — Fractional CFO | NOGL" };

export default function ReplenishmentPage() {
    return (
        <PlaceholderPage
            title="Replenishment"
            description="Suggested reorders based on forecast, lead time, and safety stock."
            icon={<Boxes className="h-5 w-5" />}
        />
    );
}
