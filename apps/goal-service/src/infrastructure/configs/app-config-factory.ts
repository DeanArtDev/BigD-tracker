import { ConfigFactory } from '@nestjs/config';
import * as process from 'node:process';

interface GOAL_APP_ENV {
  readonly API_PORT: number;
  readonly IS_DEV: boolean;
  readonly IS_PROD: boolean;
  readonly RMQ_USER: string;
  readonly RMQ_PASSWORD: string;
  readonly RMQ_PORT: number;
  readonly RMQ_HOST: string;
}

const appConfigFactory: ConfigFactory<GOAL_APP_ENV> = () => ({
  API_PORT: parseInt(process.env.API_PORT ?? '', 10) || 4033,
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  RMQ_USER: process.env.RMQ_USER ?? '',
  RMQ_PASSWORD: process.env.RMQ_PASSWORD ?? '',
  RMQ_HOST: process.env.RMQ_HOST ?? '',
  RMQ_PORT: parseInt(process.env.RMQ_PORT ?? '', 10) || 5672,
});

export { appConfigFactory, GOAL_APP_ENV };
