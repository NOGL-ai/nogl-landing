"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CompanyPage() {
  const router = useRouter();
  const params = useParams<{ slug: string; lang: string }>();

  useEffect(() => {
    if (params.lang && params.slug) {
      router.replace(`/${params.lang}/companies/${params.slug}/overview`);
    }
  }, [params.lang, params.slug, router]);

  return null;
}
