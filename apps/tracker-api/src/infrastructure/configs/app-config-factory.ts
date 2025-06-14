import { ConfigFactory } from '@nestjs/config';
import * as process from 'node:process';

interface APP_ENV {
  readonly API_PORT: number;
  readonly AUTH_SECRET_KEY: string;
  readonly IS_DEV: boolean;
  readonly IS_PROD: boolean;
  readonly SESSION_REFRESH_TIME: number;
  readonly ACCESS_TOKEN_TIME: string;
}

const appConfigFactory: ConfigFactory<APP_ENV> = () => ({
  API_PORT: parseInt(process.env.API_PORT ?? '', 10) || 3001,
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  SESSION_REFRESH_TIME: parseInt(process.env.SESSION_REFRESH_TIME ?? '', 10) || 86400000,
  AUTH_SECRET_KEY: process.env.AUTH_SECRET_KEY ?? '',
  ACCESS_TOKEN_TIME: process.env.ACCESS_TOKEN_TIME ?? '1h',
});

export { appConfigFactory, APP_ENV };
