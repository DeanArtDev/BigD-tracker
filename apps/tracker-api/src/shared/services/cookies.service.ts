import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_ENV } from '@/infrastructure/configs';
import { Response } from 'express';

export const REFRESH_TOKEN_FIELD = 'refresh_token';

@Injectable()
export class CookieService {
  constructor(private readonly config: ConfigService<APP_ENV>) {}

  setRefreshToken(res: Response, token: string | undefined) {
    if (token == null) {
      res.clearCookie(REFRESH_TOKEN_FIELD, {
        httpOnly: true,
        secure: this.config.get<boolean>('IS_PROD'),
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge: this.config.get<number>('SESSION_REFRESH_TIME'),
      });
      return;
    }

    res.cookie(REFRESH_TOKEN_FIELD, token, {
      httpOnly: true,
      secure: this.config.get<boolean>('IS_PROD'),
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: this.config.get<number>('SESSION_REFRESH_TIME'),
    });
  }
}
