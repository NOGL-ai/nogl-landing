import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export default async function ActionsPage({ params }: PageProps) {
  const { lang } = await params;
  // Keep old UI: actions route points to existing products display page.
  redirect(`/${lang}/catalog`);
}
