import { ConfigFactory } from '@nestjs/config';
import * as process from 'node:process';

interface DB_ENV {
  readonly DB_HOST: string;
  readonly DB_PORT: number;
  readonly DB_DATABASE: string;
  readonly DB_USERNAME: string;
  readonly DB_PASSWORD: string;
  readonly DATABASE_URL: string;
}

const getDBEnv = (): DB_ENV => {
  return {
    DB_HOST: process.env.DB_HOST ?? 'localhost',
    DB_DATABASE: process.env.DB_DATABASE ?? '',
    DB_USERNAME: process.env.DB_USERNAME ?? '',
    DB_PASSWORD: process.env.DB_PASSWORD ?? '',
    DATABASE_URL: process.env.DATABASE_URL ?? '',
    DB_PORT: parseInt(process.env.DB_PORT ?? '', 10) || 5432,
  };
};

/* TODO:
 *   кидать ошибку если переменная не задана в stdout
 * */
const dbConfigFactory = (): ReturnType<ConfigFactory<{ database: DB_ENV }>> => {
  return {
    database: getDBEnv(),
  };
};

export { dbConfigFactory, getDBEnv, DB_ENV };
