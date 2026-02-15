import { APP_ENV } from '@/infrastructure/configs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RmqLogger } from './rmq-logger';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { getCorrelationId } from './utils';

@Module({
  exports: [RmqLogger],
  providers: [RmqLogger],
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<APP_ENV>) => {
        const isPretty = config.get('LOG_PRETTY') === '1' || config.get('LOG_PRETTY') === 'true';

        return {
          pinoHttp: {
            level: 'info',
            base: {
              env: config.get('NODE_ENV') ?? 'broken!',
            },

            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.headers.set-cookie',
                "req.headers['x-api-key']",
              ],
              censor: '[REDACTED]',
            },

            // 3) Сужаем “что попадает в лог” по HTTP объектам
            serializers: {
              req(req) {
                return {
                  method: req.method,
                  url: req.url,
                  headers: {
                    'content-type': req.headers['content-type'],
                    'content-length': req.headers['content-length'],
                    'user-agent': req.headers['user-agent'],
                    'x-real-ip': req.headers['x-real-ip'],
                    'x-correlation-id': req.headers['x-correlation-id'],
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
            },

            mixin() {
              const correlationId = getCorrelationId();
              return correlationId ? { correlationId } : {};
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
})
export class LoggerModule {}
