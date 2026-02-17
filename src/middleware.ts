import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  // List of allowed origins (for CORS)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://yatrivo-backend-k934.vercel.app',
    'https://www.yatrivojourneys.com',
    'https://yatrivojourneys.com',
    'https://admin.yatrivojourneys.com',
  ];

  // Allow same-origin requests (no origin header or matches host)
  const isSameOrigin = !origin || origin.includes(host || '');
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  const shouldAllowCORS = isSameOrigin || isAllowedOrigin;
  
  console.log('Middleware:', {
    method: request.method,
    path: request.nextUrl.pathname,
    origin,
    host,
    shouldAllowCORS
  });
  
  // Handle preflight (OPTIONS) requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    
    if (shouldAllowCORS && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  }

  // Handle regular requests - Always allow, just set CORS headers if needed
  const response = NextResponse.next();
  
  if (shouldAllowCORS && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  return response;
}

// Configure which routes the middleware should run on
// Middleware runs on all API routes and handles CORS + same-origin
export const config = {
  matcher: '/api/:path*',
};
