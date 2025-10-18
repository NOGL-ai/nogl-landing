import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { chain } from "@/middlewares/chain";
import { withAuthMiddleware } from "@/middlewares/middleware-auth";
import withI18nMiddleware from "@/middlewares/middleware-lang";

// Create middleware chain
const middlewareChain = chain([
	withI18nMiddleware, // Handle locale first
	withAuthMiddleware, // Then handle auth
]);

export async function middleware(request: NextRequest) {
	// Create a response object to pass down the chain
	const response = NextResponse.next();

	return middlewareChain(request, {} as Record<string, unknown>, response);
}

export const config = {
	matcher: [
		// Match all paths except static files, api routes, images, fonts, and videos
		"/((?!api|_next/static|_next/image|images|fonts|videos|favicon.ico).*)",
	],
};
