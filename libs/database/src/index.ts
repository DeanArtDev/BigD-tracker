export { dbConfigFactory, getDBEnv, DB_ENV } from './config';
export { DatabaseModule, DATABASE_CONNECTION } from './database.module';

export { PostgresDatabase as Database, PostgresDatabaseOptions } from './database';

// Новое использование БД
export { KyselyPostgresDB as KyselyDatabase } from './postgres';
export { PostgresDbModule } from './postgres-db.module';
export { databaseToken } from './database.tokens';

export * from './tools';
