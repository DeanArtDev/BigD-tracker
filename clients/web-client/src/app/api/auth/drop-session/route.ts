import { NextRequest, NextResponse } from 'next/server';
import { routes } from '@/shared/routes';

const AUTH_COOKIE_NAMES = ['access_token', 'refresh_token'] as const;

function clearAuthCookies(response: NextResponse) {
  for (const name of AUTH_COOKIE_NAMES) {
    response.cookies.delete(name);
  }
}

export async function GET(request: NextRequest) {
  const redirectUrl = new URL(routes.login.path, request.url);

  const response = NextResponse.redirect(redirectUrl);

  clearAuthCookies(response);

  return response;
}
