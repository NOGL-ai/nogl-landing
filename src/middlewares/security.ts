import { NextRequest, NextResponse } from "next/server";

export function withSecurityHeaders(response: NextResponse) {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CORS headers (if needed)
  response.headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

export function withRequestLogging(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const start = Date.now();
    const method = request.method;
    const url = request.url;
    
    try {
      const response = await handler(request);
      const duration = Date.now() - start;
      
      console.log(`${method} ${url} - ${response.status} - ${duration}ms`);
      
      return withSecurityHeaders(response);
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`${method} ${url} - ERROR - ${duration}ms`, error);
      throw error;
    }
  };
}
