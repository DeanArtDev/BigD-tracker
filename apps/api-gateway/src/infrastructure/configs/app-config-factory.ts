import * as process from 'node:process';

interface APP_ENV {
  readonly API_PORT: number;
  readonly PUBLIC_SECRET_KEY: string;
  readonly IS_DEV: boolean;
  readonly IS_PROD: boolean;
  readonly ORIGIN: string;
  readonly RMQ_USER: string;
  readonly RMQ_PASSWORD: string;
  readonly RMQ_PORT: number;
  readonly RMQ_HOST: string;

  readonly SWAGGER_USER?: string;
  readonly SWAGGER_PASSWORD?: string;
  readonly LOG_PRETTY?: string;
  readonly NODE_ENV?: string;
}

const appConfigFactory = (): APP_ENV => ({
  API_PORT: parseInt(process.env.API_PORT ?? '', 10) || 4022,
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  PUBLIC_SECRET_KEY: process.env.PUBLIC_SECRET_KEY ?? '',
  ORIGIN: process.env.ORIGIN ?? '',

  RMQ_USER: process.env.RMQ_USER ?? '',
  RMQ_PASSWORD: process.env.RMQ_PASSWORD ?? '',
  RMQ_HOST: process.env.RMQ_HOST ?? '',
  RMQ_PORT: parseInt(process.env.RMQ_PORT ?? '', 10) || 5672,

  SWAGGER_USER: process.env.SWAGGER_USER,
  SWAGGER_PASSWORD: process.env.SWAGGER_PASSWORD,

  LOG_PRETTY: process.env.LOG_PRETTY,
  NODE_ENV: process.env.NODE_ENV,
});

export { appConfigFactory, APP_ENV };
