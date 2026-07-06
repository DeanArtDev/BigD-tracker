import type { NextRequest } from 'next/server';
import { NextFetchEvent, NextResponse } from 'next/server';
import { chain, mobilePlaceholder, refreshTokenProxy } from '@/middlewares';
import { apiRoutes } from '@/shared/routes';

// Порядок имеет значение: snaps wrapping order, как в Express.
const handlers = chain([refreshTokenProxy, mobilePlaceholder]);

export function proxy(req: NextRequest, event: NextFetchEvent) {
  if (req.url.endsWith(apiRoutes.dropSession.path)) {
    return NextResponse.next();
  }

  return handlers(req, event, NextResponse.next());
}

export const config = {
  matcher: ['/((?!api/graphql|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
