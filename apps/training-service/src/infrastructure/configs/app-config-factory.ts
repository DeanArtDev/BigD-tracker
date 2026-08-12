import type { Environment } from '@big-d/observability';
import { ConfigFactory } from '@nestjs/config';
import * as process from 'node:process';

interface TRAINING_APP_ENV {
  readonly API_PORT: number;
  readonly IS_DEV: boolean;
  readonly IS_PROD: boolean;
  readonly APP_ENV: Environment;
  readonly APP_VERSION: string;
  readonly INSTANCE_ID?: string;
  readonly LOG_PRETTY?: string;
  readonly RMQ_USER: string;
  readonly RMQ_PASSWORD: string;
  readonly RMQ_PORT: number;
  readonly RMQ_HOST: string;
}

const appConfigFactory: ConfigFactory<TRAINING_APP_ENV> = () => ({
  API_PORT: parseInt(process.env.API_PORT ?? '', 10) || 4044,
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  APP_ENV: process.env.APP_ENV as Environment,
  APP_VERSION: process.env.APP_VERSION ?? '',
  INSTANCE_ID: process.env.HOSTNAME,
  LOG_PRETTY: process.env.LOG_PRETTY,
  RMQ_USER: process.env.RMQ_USER ?? '',
  RMQ_PASSWORD: process.env.RMQ_PASSWORD ?? '',
  RMQ_HOST: process.env.RMQ_HOST ?? '',
  RMQ_PORT: parseInt(process.env.RMQ_PORT ?? '', 10) || 5672,
});

export { appConfigFactory, type TRAINING_APP_ENV };
