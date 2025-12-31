import {
  DynamicModule,
  Global,
  InjectionToken,
  Module,
  ModuleMetadata,
  OptionalFactoryDependency,
  Provider,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { databaseToken } from './database.tokens';
import { KyselyPostgresDB, KyselyPostgresDBOptions } from './postgres';

@Global()
@Module({})
class PostgresDbModule {
  static forRootAsync<TEnv extends object>(options: {
    imports?: ModuleMetadata['imports'];
    inject?: Array<InjectionToken | OptionalFactoryDependency>;
    useFactory: (
      config: ConfigService<TEnv>,
    ) => Promise<KyselyPostgresDBOptions> | KyselyPostgresDBOptions;
  }): DynamicModule {
    const asyncProvider: Provider = {
      provide: databaseToken.CONNECTION,
      inject: options.inject,
      useFactory: async (config: ConfigService<TEnv>) => {
        const opts = await options.useFactory(config);

        return new KyselyPostgresDB({
          host: opts.host,
          port: opts.port,
          database: opts.database,
          user: opts.user,
          password: opts.password,
        });
      },
    };

    return {
      imports: options.imports,
      module: PostgresDbModule,
      providers: [asyncProvider],
      exports: [databaseToken.CONNECTION],
    };
  }
}

export { PostgresDbModule };
