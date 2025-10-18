import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { CustomMiddleware } from './chain';

// Security configuration
const SECURITY_CONFIG = {
	// Strict Transport Security - enforce HTTPS
	hsts: 'max-age=63072000; includeSubDomains; preload',

	// Content Security Policy
	csp: `
		default-src 'self';
		script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com;
		style-src 'self' 'unsafe-inline';
		img-src 'self' blob: data: https: http:;
		font-src 'self' data:;
		connect-src 'self' https://accounts.google.com https://*.googleapis.com wss://localhost:* ws://localhost:*;
		frame-src 'self' https://accounts.google.com;
		frame-ancestors 'self';
		object-src 'none';
		base-uri 'self';
		form-action 'self';
	`.replace(/\s{2,}/g, ' ').trim(),

	// Permissions Policy
	permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
} as const;

export function withSecurityHeaders(middleware: CustomMiddleware) {
	return async (
		request: NextRequest,
		event: NextFetchEvent,
		response: NextResponse
	) => {
		// Execute next middleware first
		const res = await middleware(request, event, response);

		// Add security headers
		res.headers.set('X-DNS-Prefetch-Control', 'on');
		res.headers.set('X-Frame-Options', 'SAMEORIGIN');
		res.headers.set('X-Content-Type-Options', 'nosniff');
		res.headers.set('X-XSS-Protection', '1; mode=block');
		res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		res.headers.set('Permissions-Policy', SECURITY_CONFIG.permissionsPolicy);

		// Add HSTS only in production
		if (process.env.NODE_ENV === 'production') {
			res.headers.set('Strict-Transport-Security', SECURITY_CONFIG.hsts);
		}

		// Add CSP header
		res.headers.set('Content-Security-Policy', SECURITY_CONFIG.csp);

		return res;
	};
}

