export const ROUTE_CONFIG = {
	public: [
		'/blog',
		'/privacy-policy',
		'/tos',
		'/impressum',
		'/datenschutz',
		'/agb',
	] as const,

	protected: [
		'/dashboard',
		'/account',
		'/catalog',
		'/competitors',
		'/notifications',
		'/product-feed',
		'/profile',
		'/reports',
		'/repricing',
		'/settings',
	] as const,

	admin: ['/admin'] as const,
	user: ['/user'] as const,
	auth: ['/auth'] as const,
} as const;

export type PublicRoute = (typeof ROUTE_CONFIG.public)[number];
export type ProtectedRoute = (typeof ROUTE_CONFIG.protected)[number];
export type AdminRoute = (typeof ROUTE_CONFIG.admin)[number];
export type UserRoute = (typeof ROUTE_CONFIG.user)[number];
export type AuthRoute = (typeof ROUTE_CONFIG.auth)[number];

// Helper to get all protected paths including locale variants
export function getProtectedPaths(): string[] {
	return [
		...ROUTE_CONFIG.protected,
		...ROUTE_CONFIG.admin,
		...ROUTE_CONFIG.user,
	];
}

// Helper to check if path is public
export function isPublicPath(pathname: string): boolean {
	return ROUTE_CONFIG.public.some((route) => pathname.includes(route));
}

// Helper to check if path is protected
export function isProtectedPath(pathname: string): boolean {
	const allProtected = getProtectedPaths();
	return allProtected.some((route) => pathname.includes(route));
}

