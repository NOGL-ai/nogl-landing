import { JWT } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

// Auth context passed via headers
export interface AuthContext {
	userId?: string;
	userRole?: string;
	isAuthenticated: boolean;
}

// Type-safe header keys
export const AUTH_HEADERS = {
	USER_ID: 'x-user-id',
	USER_ROLE: 'x-user-role',
	IS_AUTHENTICATED: 'x-is-authenticated',
} as const;

// Helper to set auth headers on response
export function setAuthHeaders(
	response: NextResponse,
	token: JWT | null
): void {
	if (token) {
		response.headers.set(AUTH_HEADERS.USER_ID, token.sub || '');
		response.headers.set(AUTH_HEADERS.USER_ROLE, (token.role as string) || '');
		response.headers.set(AUTH_HEADERS.IS_AUTHENTICATED, 'true');
	} else {
		response.headers.set(AUTH_HEADERS.IS_AUTHENTICATED, 'false');
	}
}

// Helper to read auth from request headers
export function getAuthFromHeaders(request: NextRequest): AuthContext {
	return {
		userId: request.headers.get(AUTH_HEADERS.USER_ID) || undefined,
		userRole: request.headers.get(AUTH_HEADERS.USER_ROLE) || undefined,
		isAuthenticated: request.headers.get(AUTH_HEADERS.IS_AUTHENTICATED) === 'true',
	};
}

