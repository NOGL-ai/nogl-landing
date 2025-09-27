/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { getToken } from "next-auth/jwt";
import { Locale, i18n } from "@/i18n";
import { CustomMiddleware } from "./chain";

const protectedPaths = ["/admin", "/user"];

function getProtectedRoutes(protectedPaths: string[], locales: Locale[]) {
	let protectedPathsWithLocale = [...protectedPaths];

	protectedPaths.forEach((route) => {
		locales.forEach(
			(locale) =>
				(protectedPathsWithLocale = [
					...protectedPathsWithLocale,
					`/${locale}${route}`,
				])
		);
	});

	return protectedPathsWithLocale;
}

export function withAuthMiddleware(middleware: CustomMiddleware) {
	return async (request: NextRequest, event: NextFetchEvent) => {
		// Create a response object to pass down the chain
		const response = NextResponse.next();

		const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
		const isAdmin = token?.role === "ADMIN";
		const isUser = token?.role === "USER";

		// @ts-ignore
		request.nextauth = request.nextauth || {};
		// @ts-ignore
		request.nextauth.token = token;
		const pathname = request.nextUrl.pathname;

		const protectedPathsWithLocale = getProtectedRoutes(protectedPaths, [
			...i18n.locales,
		]);

		if (!token && protectedPathsWithLocale.includes(pathname)) {
			const signInUrl = new URL("/auth/signin", request.url);
			signInUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(signInUrl);
		}

		// if logged in as user redirect to user
		if (token && !isAdmin && pathname.includes("/admin")) {
			const signInUrl = new URL("/user", request.url);
			signInUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(signInUrl);
		}

		if (token && !isUser && pathname.includes("/user")) {
			const signInUrl = new URL("/admin", request.url);
			signInUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(signInUrl);
		}

		return middleware(request, event, response);
	};
}
