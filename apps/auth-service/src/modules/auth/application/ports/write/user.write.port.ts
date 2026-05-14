import { User } from '@/modules/auth/domain/aggreates';
import { AuthSpecification } from '../../specifications';
import { AuthTransaction } from '../transaction-manager.port';

const USERS_WRITE_REPOSITORY = Symbol.for('USERS_WRITE_REPOSITORY');

interface UserWriteRepository {
  create(input: { email: string; passwordHash: string }, trx?: AuthTransaction): Promise<User>;
  delete(specifications: AuthSpecification, trx?: AuthTransaction): Promise<number>;
  getOneUser(specifications: AuthSpecification, trx?: AuthTransaction): Promise<User | null>;
}

export { UserWriteRepository, USERS_WRITE_REPOSITORY };
