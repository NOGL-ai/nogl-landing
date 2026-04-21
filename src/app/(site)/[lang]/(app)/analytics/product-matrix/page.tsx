import { Suspense } from "react";

import { ProductMatrixClient } from "@/components/analytics/product-matrix/ProductMatrixClient";

export const metadata = {
  title: "Product Matrix | NOGL",
  description:
    "Configurable multi-company pivot: companies, categories, brands, price and discount dimensions with presets and drill-down.",
};

function MatrixFallback() {
  return (
    <div className="flex flex-col gap-4 p-6 lg:p-8">
      <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
      <div className="h-96 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export default function ProductMatrixPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <Suspense fallback={<MatrixFallback />}>
        <ProductMatrixClient />
      </Suspense>
    </div>
  );
}
