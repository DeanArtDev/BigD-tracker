import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ONLY_ROUTES = ['/login', '/signup'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // const token = request.cookies.get('sid')?.value;
  // const isAuthenticated = Boolean(token);
  //
  // if (isAuthenticated && PUBLIC_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }
  //
  // if (!isAuthenticated && !PUBLIC_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
