import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { getToken } from "next-auth/jwt";
import { Locale, i18n } from "@/i18n";
import { CustomMiddleware } from "./chain";
import { getProtectedPaths } from "@/config/routes.config";
import { setAuthHeaders } from "@/types/middleware.types";

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
		// Development-only bypass: Skip auth checks in local development
		// This will NEVER run in production due to NODE_ENV check
		if (process.env.NODE_ENV === 'development') {
			console.log('🔓 Development mode: Auth checks disabled');
			return middleware(request, event, NextResponse.next());
		}

		// Production auth logic below
		// Create a response object to pass down the chain
		const response = NextResponse.next();

		const token = await getToken({
			req: request,
			secret: process.env.NEXTAUTH_SECRET,
		});
		const isAdmin = token?.role === "ADMIN";
		const isUser = token?.role === "USER";

		// Set auth information in response headers (type-safe)
		setAuthHeaders(response, token);
		
		const pathname = request.nextUrl.pathname;

		// Handle root route redirect based on auth state
		// Check if pathname is exactly /{locale} or /{locale}/
		const isRootRoute = i18n.locales.some(
			(locale) => pathname === `/${locale}` || pathname === `/${locale}/`
		);

		if (isRootRoute) {
			if (!token) {
				// Unauthenticated: redirect to signin
				return NextResponse.redirect(new URL(`${pathname.endsWith('/') ? pathname : pathname + '/'}auth/signin`, request.url));
			} else if (isAdmin) {
				// Admin: redirect to admin dashboard
				return NextResponse.redirect(new URL(`${pathname.endsWith('/') ? pathname : pathname + '/'}admin`, request.url));
			} else {
				// Regular user: redirect to dashboard
				return NextResponse.redirect(new URL(`${pathname.endsWith('/') ? pathname : pathname + '/'}dashboard`, request.url));
			}
		}

		const protectedPathsWithLocale = getProtectedRoutes(getProtectedPaths(), [
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
