import { isBaseRpcException } from '@big-d/api-contracts';
import { isBaseException } from '@big-d/exceptions';
import { DynamicModule, InjectionToken, Module, ModuleMetadata, OptionalFactoryDependency } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { AsyncLocalStorage } from 'node:async_hooks';
import { RequestContext } from './request-context';
import { RmqInboundLoggingInterceptor } from './rmq-inbound-logger.interceptor';
import { RmqLogger } from './rmq-logger';

interface LoggerModuleOptions {
  readonly level?: string | '1';
  readonly env: string;
}

@Module({})
class ObservabilityModule {
  static forRootAsync<TEnv extends object>(options: {
    global?: boolean;
    imports?: ModuleMetadata['imports'];
    requestContext: AsyncLocalStorage<RequestContext>;
    inject?: Array<InjectionToken | OptionalFactoryDependency>;
    useFactory: (config: ConfigService<TEnv>) => Promise<LoggerModuleOptions> | LoggerModuleOptions;
  }): DynamicModule {
    return {
      global: options.global,
      module: ObservabilityModule,
      exports: [RmqLogger, RmqInboundLoggingInterceptor],
      providers: [RmqLogger, RmqInboundLoggingInterceptor],
      imports: [
        ...(options.imports ?? []),

        PinoLoggerModule.forRootAsync({
          inject: options.inject,
          useFactory: async (config: ConfigService<TEnv>) => {
            const opts = await options.useFactory(config);
            const { env } = opts;

            const isPretty = env === 'development';

            return {
              pinoHttp: {
                level: 'info',
                base: { env },

                redact: {
                  paths: [
                    'req.query.token',
                    'req.query.accessToken',
                    'req.query.refreshToken',
                    'req.headers.authorization',
                    'req.headers.cookie',
                    'req.headers.set-cookie',
                    "req.headers['x-api-key']",
                    'err.stack',
                    'error.stack',
                  ],
                  censor: '[REDACTED]',
                },

                serializers: {
                  req(req) {
                    return {
                      method: req.method,
                      baseUrl: req.params.path.join('/'),
                      query: req.query,
                      headers: {
                        'content-type': req.headers['content-type'],
                        'content-length': req.headers['content-length'],
                        'user-agent': req.headers['user-agent'],
                        'x-real-ip': req.headers['x-real-ip'],
                        'x-correlation-id': req.headers['x-correlation-id'],
                        'x-user-timezone': req.headers['x-user-timezone'],
                        referer: req.headers['referer'],
                        'x-forwarded-for': req.ip || req.headers['x-forwarded-for'],
                      },
                      remoteAddress: req.socket?.remoteAddress,
                    };
                  },

                  res(res) {
                    return {
                      statusCode: res.statusCode,
                    };
                  },

                  err: (err) => {
                    if (isBaseRpcException(err)) {
                      return {
                        key: err.key,
                        code: err.code,
                        kind: err.kind,
                        details: err.details,
                      };
                    }

                    if (isBaseException(err)) {
                      return {
                        key: err.key,
                        code: err.code,
                        details: err.details,
                      };
                    }

                    return err;
                  },
                },

                mixin() {
                  const requestContext = options.requestContext.getStore();
                  const cid = requestContext?.correlationId ?? 'There is no correlation id!';
                  return cid ? { correlationId: cid, ...requestContext } : {};
                },

                timestamp: () => `,"ts":"${new Date().toISOString()}"`,

                ...(isPretty
                  ? {
                      level: 'trace',
                      transport: {
                        target: 'pino-pretty',
                        options: {
                          colorize: true,
                          singleLine: false,
                          translateTime: 'SYS:standard',
                          ignore: 'pid,hostname',
                        },
                      },
                    }
                  : {}),
              },
            };
          },
        }),
      ],
    };
  }
}

export { ObservabilityModule, LoggerModuleOptions };
