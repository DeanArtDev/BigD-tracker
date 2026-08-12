import type { ApplicationLog } from '../contracts';

/** Output boundary implemented by a concrete logging adapter such as Pino. */
interface LogWriter {
  write(log: ApplicationLog): void;
}

export type { LogWriter };
