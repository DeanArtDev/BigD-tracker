import { REFRESH_TOKEN_KEY } from '@/modules/auth/decorators';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_ENV } from '@/infrastructure/configs';
import { Response } from 'express';

export const REFRESH_TOKEN_FIELD = 'refresh_token';

const tokenPath = {
  [ACCESS_TOKEN_KEY]: '/',
  [REFRESH_TOKEN_KEY]: '/',
};

@Injectable()
export class CookieService {
  constructor(private readonly config: ConfigService<APP_ENV>) {}

  dropTokens(res: Response) {
    this.setRefreshTokenByKey(ACCESS_TOKEN_KEY, { token: undefined, maxAge: 0 }, res);
    this.setRefreshTokenByKey(REFRESH_TOKEN_KEY, { token: undefined, maxAge: 0 }, res);
  }

  setRefreshTokenByKey(
    key: typeof REFRESH_TOKEN_KEY | typeof ACCESS_TOKEN_KEY,
    params: { token: string | undefined; maxAge: number },
    res: Response,
  ) {
    const { maxAge, token } = params;

    const isProd = this.config.get<boolean>('IS_PROD');

    if (token == null) {
      res.clearCookie(key, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: tokenPath[key],
        maxAge,
      });
      return;
    }

    res.cookie(key, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: tokenPath[key],
      maxAge,
    });
  }
}
