import { Session } from '@/modules/auth/domain/aggreates';
import { AuthTransaction } from '../transaction-manager.port';

const SESSIONS_WRITE_REPOSITORY = Symbol.for('SESSIONS_WRITE_REPOSITORY');

interface SessionWriteRepository {
  create(input: Session, trx?: AuthTransaction): Promise<Session>;
}

export { SessionWriteRepository, SESSIONS_WRITE_REPOSITORY };
