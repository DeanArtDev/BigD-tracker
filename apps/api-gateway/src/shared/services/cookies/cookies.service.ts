import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_ENV } from '@/infrastructure/configs';
import { Response } from 'express';

export const REFRESH_TOKEN_FIELD = 'refresh_token';

@Injectable()
export class CookieService {
  constructor(private readonly config: ConfigService<APP_ENV>) {}

  setRefreshToken(res: Response, params: { token: string | undefined; maxAge?: number }) {
    const { maxAge, token } = params;

    const isProd = this.config.get<boolean>('IS_PROD');

    if (token == null) {
      res.clearCookie(REFRESH_TOKEN_FIELD, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/api/auth/refresh',
        maxAge,
      });
      return;
    }

    res.cookie(REFRESH_TOKEN_FIELD, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/auth/refresh',
      maxAge,
    });
  }
}
