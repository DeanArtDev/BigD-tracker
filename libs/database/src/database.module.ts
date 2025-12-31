import {
  DynamicModule,
  Global,
  Module,
  Provider,
  OptionalFactoryDependency,
  InjectionToken,
  ModuleMetadata,
} from '@nestjs/common';
import { PostgresDatabaseOptions, PostgresDatabase } from './database';

/**
 * @deprecated используй KyselyPostgresDB, databaseToken, PostgresDbModule
 * */
const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');

/**
 * @deprecated используй KyselyPostgresDB, databaseToken, PostgresDbModule
 * */
@Global()
@Module({})
class DatabaseModule {
  static forRoot(options: PostgresDatabaseOptions): DynamicModule {
    const provider: Provider = {
      provide: DATABASE_CONNECTION,
      useFactory: () => {
        return new PostgresDatabase({
          host: options.host,
          port: options.port,
          database: options.database,
          user: options.user,
          password: options.password,
          logging: options.logging,
        });
      },
    };

    return {
      module: DatabaseModule,
      providers: [provider],
      exports: [provider],
    };
  }

  static forRootAsync(options: {
    imports?: ModuleMetadata['imports'];
    inject?: Array<InjectionToken | OptionalFactoryDependency>;
    useFactory: (...args: any[]) => Promise<PostgresDatabaseOptions> | PostgresDatabaseOptions;
  }): DynamicModule {
    const asyncProvider: Provider = {
      provide: DATABASE_CONNECTION,
      useFactory: async (...args: any[]) => {
        const opts = await options.useFactory(...args);

        return new PostgresDatabase({
          host: opts.host,
          port: opts.port,
          database: opts.database,
          user: opts.user,
          password: opts.password,
        });
      },
      inject: options.inject || [],
    };

    return {
      module: DatabaseModule,
      imports: options.imports,
      providers: [asyncProvider],
      exports: [asyncProvider],
    };
  }
}

export { DATABASE_CONNECTION, DatabaseModule };
