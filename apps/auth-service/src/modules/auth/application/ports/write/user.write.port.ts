import { User } from '@/modules/auth/domain/aggreates';
import { AuthTransaction } from '../transaction-manager.port';

const USERS_WRITE_REPOSITORY = Symbol.for('USERS_WRITE_REPOSITORY');

interface UserWriteRepository {
  create(input: { email: string; passwordHash: string }, trx?: AuthTransaction): Promise<User>;
}

export { UserWriteRepository, USERS_WRITE_REPOSITORY };
