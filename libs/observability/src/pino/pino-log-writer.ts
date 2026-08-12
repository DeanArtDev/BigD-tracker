import type { ApplicationLog } from '../contracts';
import type { LogWriter } from '../core/log-writer';
import type { Logger } from 'pino';

/** Writes application logs through a configured Pino instance. */
class PinoLogWriter implements LogWriter {
  constructor(private readonly logger: Logger) {}

  write(log: ApplicationLog): void {
    const { level, ...payload } = log;

    this.logger[level](payload);
  }
}

export { PinoLogWriter };
