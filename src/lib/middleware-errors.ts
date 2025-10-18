import { NextRequest } from 'next/server';

export class MiddlewareError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly statusCode: number = 500,
		public readonly context?: Record<string, unknown>
	) {
		super(message);
		this.name = 'MiddlewareError';
		Error.captureStackTrace(this, this.constructor);
	}
}

export class AuthenticationError extends MiddlewareError {
	constructor(message: string = 'Authentication failed', context?: Record<string, unknown>) {
		super(message, 'AUTH_ERROR', 401, context);
	}
}

export class AuthorizationError extends MiddlewareError {
	constructor(message: string = 'Insufficient permissions', context?: Record<string, unknown>) {
		super(message, 'AUTHZ_ERROR', 403, context);
	}
}

export class LocaleError extends MiddlewareError {
	constructor(message: string = 'Locale detection failed', context?: Record<string, unknown>) {
		super(message, 'LOCALE_ERROR', 500, context);
	}
}

// Structured error logger
export function logMiddlewareError(
	error: unknown,
	request: NextRequest,
	phase: 'i18n' | 'auth' | 'security'
): void {
	const errorDetails = {
		timestamp: new Date().toISOString(),
		phase,
		url: request.url,
		method: request.method,
		userAgent: request.headers.get('user-agent'),
		error: error instanceof Error ? {
			name: error.name,
			message: error.message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		} : { message: 'Unknown error' },
		context: error instanceof MiddlewareError ? error.context : undefined,
	};

	// Log to console (in production, send to logging service)
	console.error('[Middleware Error]', JSON.stringify(errorDetails, null, 2));

	// In production, send to service like Sentry
	if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
		// Example: Sentry.captureException(error, { extra: errorDetails });
	}
}

