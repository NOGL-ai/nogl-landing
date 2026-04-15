import { redirect } from "next/navigation";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  redirect(`/${lang}/companies/${slug}/overview`);
}
