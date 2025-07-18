import { ConfigFactory } from '@nestjs/config';
import * as process from 'node:process';

interface APP_ENV {
  readonly API_PORT: number;
  readonly AUTH_SECRET_KEY: string;
  readonly IS_DEV: boolean;
  readonly IS_PROD: boolean;
  readonly ORIGIN: string;
  readonly RMQ_USER: string;
  readonly RMQ_PASSWORD: string;
  readonly RMQ_PORT: number;
  readonly RMQ_HOST: string;
}

const appConfigFactory: ConfigFactory<APP_ENV> = () => ({
  API_PORT: parseInt(process.env.API_PORT ?? '', 10) || 4022,
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  AUTH_SECRET_KEY: process.env.AUTH_SECRET_KEY ?? '',
  ORIGIN: process.env.ORIGIN ?? '',
  RMQ_USER: process.env.RMQ_USER ?? '',
  RMQ_PASSWORD: process.env.RMQ_PASSWORD ?? '',
  RMQ_HOST: process.env.RMQ_HOST ?? '',
  RMQ_PORT: parseInt(process.env.RMQ_PORT ?? '', 10) || 5672,
});

export { appConfigFactory, APP_ENV };
