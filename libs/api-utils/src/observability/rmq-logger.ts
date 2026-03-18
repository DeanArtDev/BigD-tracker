import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger, pino } from 'pino';
import { SENSITIVE_LOG_PATHS } from './redact-paths';
import { serializeErrorForLog } from './error-serializer';

interface ILoggerService {
  log: Logger['info'];
  warn: Logger['warn'];
  error: Logger['error'];
  debug: Logger['debug'];
  fatal: Logger['fatal'];
  trace: Logger['trace'];
}

@Injectable()
export class RmqLogger implements ILoggerService {
  logger: Logger;

  constructor(private readonly configService: ConfigService) {
    const isDev = this.configService.get('NODE_ENV', 'production') === 'development';

    this.logger = pino({
      redact: {
        paths: [...SENSITIVE_LOG_PATHS],
        remove: true,
      },

      serializers: {
        err: serializeErrorForLog,
      },

      ...(isDev
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

      timestamp: () => `,"ts":"${new Date().toISOString()}"`,
    });
  }

  public log = (...params: Parameters<typeof this.logger.info>): void => {
    this.logger.info(...params);
  };

  public warn = (...params: Parameters<typeof this.logger.warn>): void => {
    this.logger.warn(...params);
  };

  public error = (...params: Parameters<typeof this.logger.error>): void => {
    this.logger.error(...params);
  };

  public debug = (...params: Parameters<typeof this.logger.debug>): void => {
    this.logger.debug(...params);
  };

  public fatal = (...params: Parameters<typeof this.logger.fatal>): void => {
    this.logger.fatal(...params);
  };

  public trace = (...params: Parameters<typeof this.logger.trace>): void => {
    this.logger.trace(...params);
  };
}
