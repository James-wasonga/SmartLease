import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('userRole')?.value;

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/tenant') && role !== 'tenant') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/landlord') && role !== 'landlord') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tenant/:path*', '/landlord/:path*'],
};