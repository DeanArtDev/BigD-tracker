import { isBaseRpcException } from '@big-d/api-contracts';
import { isBaseException } from '@big-d/exceptions';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger, pino } from 'pino';

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
    const isDev = this.configService.get('NODE_ENV', 'development');

    this.logger = pino({
      redact: {
        paths: [
          'data.sessionToke',
          'data.session',
          'data.token',
          'token',
          'err.stack',
          'error.stack',
          'error.type',
          'err.type',
        ],
        remove: true,
      },

      serializers: {
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

          return {
            message: 'Unknown error!!!!!',
          };
        },
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

  public setBindings = (...params: Parameters<typeof this.logger.setBindings>) => {
    return this.logger.setBindings(...params);
  };

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
