import { Session } from '@/modules/auth/domain/aggreates';
import { AuthSpecification } from '../../specifications';
import { AuthTransaction } from '../transaction-manager.port';

const SESSIONS_WRITE_REPOSITORY = Symbol.for('SESSIONS_WRITE_REPOSITORY');

interface SessionWriteRepository {
  getOne(specifications: AuthSpecification, trx?: AuthTransaction): Promise<Session | null>;
  getMany(specifications: AuthSpecification, trx?: AuthTransaction): Promise<Session[]>;
  create(input: Session, trx?: AuthTransaction): Promise<Session>;
  delete(specifications: AuthSpecification, trx?: AuthTransaction): Promise<void>;
}

export { SessionWriteRepository, SESSIONS_WRITE_REPOSITORY };
