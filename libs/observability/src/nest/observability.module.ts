import { ObservabilityContextStorage } from '../context';
import type { ObservabilityLogger } from '../core';
import {
  createPinoObservabilityLogger,
  type CreatePinoObservabilityLoggerOptions,
} from '../pino/create-pino-observability-logger';
import {
  Global,
  Module,
  type DynamicModule,
  type FactoryProvider,
  type ModuleMetadata,
  type Provider,
} from '@nestjs/common';
import { OBSERVABILITY_LOGGER } from './observability.tokens';
import { ServiceLifecycleLogger } from './service-lifecycle.logger';

type ObservabilityModuleOptions = Omit<CreatePinoObservabilityLoggerOptions, 'destination'>;

interface ObservabilityModuleAsyncOptions<TFactoryArgs extends readonly unknown[] = readonly unknown[]>
  extends Pick<ModuleMetadata, 'imports'>, Pick<FactoryProvider, 'inject'> {
  readonly useFactory: (...args: TFactoryArgs) => ObservabilityModuleOptions | Promise<ObservabilityModuleOptions>;
}

@Global()
@Module({})
class ObservabilityModule {
  static forRoot(options: ObservabilityModuleOptions): DynamicModule {
    return this.createDynamicModule([], {
      provide: OBSERVABILITY_LOGGER,
      useFactory: (): ObservabilityLogger => createPinoObservabilityLogger(options),
    });
  }

  static forRootAsync<TFactoryArgs extends readonly unknown[]>(
    options: ObservabilityModuleAsyncOptions<TFactoryArgs>,
  ): DynamicModule {
    const loggerProvider: FactoryProvider<ObservabilityLogger> = {
      provide: OBSERVABILITY_LOGGER,
      inject: options.inject ?? [],
      useFactory: async (...args: TFactoryArgs): Promise<ObservabilityLogger> =>
        createPinoObservabilityLogger(await options.useFactory(...args)),
    };

    return this.createDynamicModule(options.imports ?? [], loggerProvider);
  }

  private static createDynamicModule(
    imports: NonNullable<ModuleMetadata['imports']>,
    loggerProvider: Provider,
  ): DynamicModule {
    return {
      module: ObservabilityModule,
      global: true,
      imports,
      providers: [ObservabilityContextStorage, ServiceLifecycleLogger, loggerProvider],
      exports: [OBSERVABILITY_LOGGER, ObservabilityContextStorage, ServiceLifecycleLogger],
    };
  }
}

export { ObservabilityModule, type ObservabilityModuleAsyncOptions, type ObservabilityModuleOptions };
