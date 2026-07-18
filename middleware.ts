import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');

  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
