"use client";

import { useState, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Props {
  brandView: ReactNode;
  productView: ReactNode;
  /** Initial tab — "brand" (default) or "product". Can be overridden by `?tab=` search param handled on the server. */
  initial?: "brand" | "product";
}

/**
 * Client wrapper that renders the two pre-rendered server views inside
 * a Radix tab shell. Both views are rendered into the DOM so switching
 * is instant (no client refetch). Server-side data fetching happens
 * once per request.
 */
export function TrendsTabs({ brandView, productView, initial = "brand" }: Props) {
  const [active, setActive] = useState<"brand" | "product">(initial);

  return (
    <Tabs
      value={active}
      onValueChange={(v) => setActive(v === "product" ? "product" : "brand")}
      className="w-full"
    >
      <TabsList className="mb-4">
        <TabsTrigger value="brand">Brand Trends</TabsTrigger>
        <TabsTrigger value="product">Product Trends</TabsTrigger>
      </TabsList>
      <TabsContent value="brand" className="mt-0">
        {brandView}
      </TabsContent>
      <TabsContent value="product" className="mt-0">
        {productView}
      </TabsContent>
    </Tabs>
  );
}
