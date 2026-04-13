"use client";

import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import type { Session } from "next-auth";
import type { AbstractIntlMessages } from "next-intl";

import type { AppLocale } from "@/lib/i18n/loadMessages";

export function Providers({
	children,
	session,
	locale,
	messages,
}: {
	children: React.ReactNode;
	session: Session | null;
	locale: AppLocale;
	messages: AbstractIntlMessages;
}) {
	return (
		<SessionProvider
			session={session}
			refetchInterval={0}
			refetchOnWindowFocus={false}
		>
			<NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
				{children}
			</NextIntlClientProvider>
		</SessionProvider>
	);
}
