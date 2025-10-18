import { redirect } from "next/navigation";
import { Locale } from "@/i18n";
import { getAuthSession } from "@/lib/auth";

// Root page now handled by middleware - this is a fallback
// The middleware will redirect to appropriate location based on auth state
export default async function RootPage({
	params,
}: {
	params: Promise<{ lang: Locale }>;
}) {
	const { lang } = await params;
	const session = await getAuthSession();

	// Fallback redirect logic (middleware should handle this)
	if (!session) {
		redirect(`/${lang}/auth/signin`);
	}

	// Check user role
	const isAdmin = session.user?.role === "ADMIN";

	if (isAdmin) {
		redirect(`/${lang}/admin`);
	}

	redirect(`/${lang}/dashboard`);
}
