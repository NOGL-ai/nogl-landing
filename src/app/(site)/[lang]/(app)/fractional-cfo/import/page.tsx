import { Database } from "lucide-react";
import { PlaceholderPage } from "../_PlaceholderPage";

export const metadata = { title: "Import data — Fractional CFO | NOGL" };

export default function ImportDataPage() {
    return (
        <PlaceholderPage
            title="Import data"
            description="Upload sales, inventory, and supplier data — or connect a source."
            icon={<Database className="h-5 w-5" />}
        />
    );
}
