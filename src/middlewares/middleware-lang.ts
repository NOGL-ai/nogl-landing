import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import { i18n } from "@/i18n";

import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { CustomMiddleware } from "./chain";
import { LocaleError, logMiddlewareError } from "@/lib/middleware-errors";

function getLocale(request: NextRequest): string | undefined {
	const negotiatorHeaders: Record<string, string> = {};
	request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

	const locales = [...i18n.locales] as string[];
	const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

	// Filter out invalid locales and ensure we have valid language codes
	const validLanguages = languages.filter((lang) => {
		try {
			// Check if the language code is valid
			return typeof lang === "string" && lang.length >= 2 && lang.length <= 5;
		} catch {
			return false;
		}
	});

	// If no valid languages, return default locale
	if (validLanguages.length === 0) {
		return i18n.defaultLocale;
	}

	try {
		const locale = matchLocale(validLanguages, locales, i18n.defaultLocale);
		return locale;
	} catch (error) {
		// If locale matching fails, return default locale
		logMiddlewareError(
			new LocaleError('Locale matching failed', { validLanguages }),
			request,
			'i18n'
		);
		return i18n.defaultLocale;
	}
}

export default function withI18nMiddleware(middleware: CustomMiddleware) {
	return async (
		request: NextRequest,
		event: NextFetchEvent,
		response: NextResponse
	) => {
		// do i18n stuff
		const pathname = request.nextUrl.pathname;
		const pathnameIsMissingLocale = i18n.locales.every(
			(locale) =>
				!pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
		);

		// Redirect if there is no locale
		if (pathnameIsMissingLocale) {
			const locale = getLocale(request);
			return NextResponse.redirect(
				new URL(
					`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
					request.url
				)
			);
		}

		return middleware(request, event, response);
	};
}
