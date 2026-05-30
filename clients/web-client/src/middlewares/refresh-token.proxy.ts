import { jwtDecode } from 'jwt-decode';
import { NextResponse } from 'next/server';
import { parseSetCookie } from 'set-cookie-parser';
import { routes } from '@/shared/routes';
import { fetchRefreshToken } from '@/shared/transport/graphql';
import { ProxyFactory } from './helpers';

const refreshTokenProxy: ProxyFactory = (next) => async (req, event, res) => {
  const access = req.cookies.get('access_token')?.value;
  const refresh = req.cookies.get('refresh_token')?.value;

  /* TODO: FIXME: temp place move to sep middleware if will need to extend redirect logic */
  if (req.url.endsWith('/login') && access != null && refresh != null) {
    return NextResponse.redirect(new URL(routes.home.path, req.url));
  }

  if (access == null || refresh == null) return next(req, event, res);

  if (isExpiringSoon(access, 60)) {
    const headers: Record<string, string> = {};
    const userAgent = req.headers.get('user-agent') ?? undefined;
    headers.cookie = `refresh_token=${refresh}; access_token=${access};`;
    if (userAgent != null && userAgent.length > 0) {
      headers['user-agent'] = userAgent;
    }

    try {
      const refreshTokenResponse = await fetchRefreshToken({ headers });

      if (refreshTokenResponse.response.ok != null) {
        const rawSetCookies = refreshTokenResponse.response.headers.getSetCookie();
        const parsed = parseSetCookie(rawSetCookies);

        for (const c of parsed) {
          req.cookies.set(c.name, c.value);
        }

        const response = NextResponse.next({ request: { headers: req.headers } });

        for (const c of parsed) {
          response.cookies.set(c.name, c.value, {
            path: c.path,
            domain: c.domain,
            httpOnly: c.httpOnly,
            secure: c.secure,
            sameSite: c.sameSite as 'lax' | 'strict' | 'none' | undefined,
            maxAge: c.maxAge,
            expires: c.expires,
          });
        }

        return next(req, event, response);
      }

      req.headers.delete('access_token');
      req.headers.delete('refresh_token');
    } catch {
      req.headers.delete('access_token');
      req.headers.delete('refresh_token');
    }
  }

  return next(req, event, res);
};

function isExpiringSoon(token: string, bufferSec: number): boolean {
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    if (!exp) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return bufferSec >= exp - nowSec;
  } catch {
    return true;
  }
}

export { refreshTokenProxy };
