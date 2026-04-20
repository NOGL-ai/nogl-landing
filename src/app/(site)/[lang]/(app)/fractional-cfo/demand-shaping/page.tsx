import { Beaker01 as FlaskConical } from '@untitledui/icons';

import { PlaceholderPage } from "../_PlaceholderPage";

export const metadata = { title: "Demand shaping — Fractional CFO | NOGL" };

export default function DemandShapingPage() {
    return (
        <PlaceholderPage
            title="Demand shaping (Beta)"
            description="Run what-if scenarios on price, promo, and assortment changes."
            icon={<FlaskConical className="h-5 w-5" />}
        />
    );
}
