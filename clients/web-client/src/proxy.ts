import type { NextRequest } from 'next/server';
import { NextFetchEvent, NextResponse } from 'next/server';
import { chain, refreshToken } from '@/middlewares';

// Порядок имеет значение: snaps wrapping order, как в Express.
const handlers = chain([refreshToken]);

export function proxy(req: NextRequest, event: NextFetchEvent) {
  return handlers(req, event, NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
