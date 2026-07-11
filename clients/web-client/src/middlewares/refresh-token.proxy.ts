import { jwtDecode } from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';
import { parseSetCookie } from 'set-cookie-parser';
import { getEnvConfigClient } from '@/shared/lib';
import { apiRoutes, routes } from '@/shared/routes';
import { fetchRefreshToken } from '@/shared/transport/graphql';
import { ProxyFactory } from './helpers';

const clientConfig = getEnvConfigClient();

function fetchRefresh({
  req,
  accessToken,
  refreshToken,
}: {
  req: NextRequest;
  accessToken: string;
  refreshToken: string;
}) {
  const headers: Record<string, string> = {};
  const userAgent = req.headers.get('user-agent') ?? undefined;
  headers.cookie = `refresh_token=${refreshToken}; access_token=${accessToken};`;
  if (userAgent != null && userAgent.length > 0) {
    headers['user-agent'] = userAgent;
  }
  return fetchRefreshToken({ uri: clientConfig.NEXT_PUBLIC_HTTP_API_URL, headers });
}

const refreshTokenProxy: ProxyFactory = (next) => async (req, event, res) => {
  const access = req.cookies.get('access_token')?.value;
  const refresh = req.cookies.get('refresh_token')?.value;

  /* TODO: FIXME: temp place move to sep middleware if will need to extend redirect logic */
  if (req.url.endsWith('/login') && access != null && refresh != null) {
    return NextResponse.redirect(new URL(routes.home.path, req.url));
  }

  if (access == null || refresh == null) return next(req, event, res);

  if (isExpiringSoon(access, 60)) {
    const dropSession = () => NextResponse.redirect(new URL(apiRoutes.dropSession.path, req.url));

    try {
      const refreshTokenResponse = await fetchRefresh({ req, accessToken: access, refreshToken: refresh });

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

      return dropSession();
    } catch {
      return dropSession();
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
