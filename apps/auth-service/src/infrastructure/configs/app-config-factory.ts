import { registerAs } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as process from 'node:process';
import { z } from 'zod';
import type { Environment } from '@big-d/observability';

interface AUTH_APP_ENV {
  readonly API_PORT: number;
  readonly IS_DEV: boolean;
  readonly IS_PROD: boolean;
  readonly APP_ENV: Environment;
  readonly APP_VERSION: string;
  readonly INSTANCE_ID?: string;

  readonly RMQ_USER: string;
  readonly RMQ_PASSWORD: string;
  readonly RMQ_PORT: number;
  readonly RMQ_HOST: string;

  readonly DB_HOST: string;
  readonly DB_PASSWORD: string;
  readonly DB_PORT: number;
  readonly DB_DATABASE: string;
  readonly DB_USERNAME: string;

  readonly LOG_PRETTY?: string;
}

const envSchema = z.object({
  API_PORT: z.coerce.number(),
  TZ: z.string(),
  NODE_ENV: z.union([z.literal('production'), z.literal('development'), z.literal('test')]),
  APP_ENV: z.enum(['local', 'test', 'dev-stage', 'production']),
  APP_VERSION: z.string().min(1),

  RMQ_USER: z.string(),
  RMQ_PASSWORD: z.string(),
  RMQ_PORT: z.coerce.number(),
  RMQ_HOST: z.string(),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_DATABASE: z.string(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),

  LOG_PRETTY: z.literal('1').optional(),
});

const rmqConfig = registerAs('rmq-client', () => ({
  USER: process.env.RMQ_USER ?? '',
  PASSWORD: process.env.RMQ_PASSWORD ?? '',
  HOST: process.env.RMQ_HOST ?? '',
  PORT: parseInt(process.env.RMQ_PORT ?? '', 10),
}));

const dbConfig = registerAs('db', () => ({
  HOST: process.env.DB_HOST ?? '',
  PORT: parseInt(process.env.DB_PORT ?? '', 10),
  DATABASE: process.env.DB_DATABASE ?? '',
  USERNAME: process.env.DB_USERNAME ?? '',
  PASSWORD: process.env.DB_PASSWORD ?? '',
}));

const authSchema = z.object({
  PRIVATE_AUTH_KEY: z.string(),
  REFRESH_EXPIRE_TIME: z.string(),
  ACCESS_EXPIRE_TIME: z.string(),
});

type AUTH_ENV = z.output<typeof authSchema>;
const authConfig = registerAs<AUTH_ENV>('auth', () => {
  return {
    ACCESS_EXPIRE_TIME: process.env.ACCESS_EXPIRE_TIME!,
    REFRESH_EXPIRE_TIME: process.env.REFRESH_EXPIRE_TIME!,
    PRIVATE_AUTH_KEY: readFileSync(join(process.cwd(), 'keys/private.pem'), 'utf8'),
  };
});

const appConfigFactory = (): AUTH_APP_ENV => {
  const rmq = rmqConfig();
  const db = dbConfig();

  return {
    API_PORT: parseInt(process.env.API_PORT ?? '', 10),
    IS_DEV: process.env.NODE_ENV === 'development',
    IS_PROD: process.env.NODE_ENV === 'production',
    APP_ENV: process.env.APP_ENV as Environment,
    APP_VERSION: process.env.APP_VERSION ?? '',
    INSTANCE_ID: process.env.HOSTNAME,
    LOG_PRETTY: process.env.LOG_PRETTY,

    RMQ_USER: rmq.USER,
    RMQ_PASSWORD: rmq.PASSWORD,
    RMQ_PORT: rmq.PORT,
    RMQ_HOST: rmq.HOST,

    DB_HOST: db.HOST,
    DB_PORT: db.PORT,
    DB_DATABASE: db.DATABASE,
    DB_USERNAME: db.USERNAME,
    DB_PASSWORD: db.PASSWORD,
  };
};

const authConfigSchema = envSchema.extend({ ...authSchema.shape });

export { appConfigFactory, rmqConfig, dbConfig, authConfig, authConfigSchema, type AUTH_APP_ENV, AUTH_ENV };
