import { registerAs } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as process from 'node:process';
import z from 'zod';

interface APP_ENV {
  readonly API_PORT: number;
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

const authSchema = z.object({ AUTH_PUBLIC_KEY: z.string() });

type AUTH_ENV = z.output<typeof authSchema>;
const authConfig = registerAs<AUTH_ENV>('auth', () => {
  const config = {
    AUTH_PUBLIC_KEY: readFileSync(join(process.cwd(), 'keys/public.pem'), 'utf8'),
  };
  return authSchema.parse(config);
});

const envSchema = z.object({
  API_PORT: z.coerce.number(),
  TZ: z.string(),
  NODE_ENV: z.union([z.literal('production'), z.literal('development'), z.literal('test')]),

  RMQ_USER: z.string(),
  RMQ_PASSWORD: z.string(),
  RMQ_PORT: z.coerce.number(),
  RMQ_HOST: z.string(),

  ORIGIN: z.string(),

  LOG_PRETTY: z.string(),

  SWAGGER_USER: z.string(),
  SWAGGER_PASSWORD: z.string(),
});

const appConfigFactory = (): APP_ENV => {
  return {
    API_PORT: parseInt(process.env.API_PORT ?? '', 10) || 4022,
    IS_DEV: process.env.NODE_ENV === 'development',
    IS_PROD: process.env.NODE_ENV === 'production',
    ORIGIN: process.env.ORIGIN ?? '',

    RMQ_USER: process.env.RMQ_USER ?? '',
    RMQ_PASSWORD: process.env.RMQ_PASSWORD ?? '',
    RMQ_HOST: process.env.RMQ_HOST ?? '',
    RMQ_PORT: parseInt(process.env.RMQ_PORT ?? '', 10) || 5672,

    SWAGGER_USER: process.env.SWAGGER_USER,
    SWAGGER_PASSWORD: process.env.SWAGGER_PASSWORD,

    LOG_PRETTY: process.env.LOG_PRETTY,
    NODE_ENV: process.env.NODE_ENV,
  };
};

export { appConfigFactory, envSchema, authConfig, AUTH_ENV, APP_ENV };
