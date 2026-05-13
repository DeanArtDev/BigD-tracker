import { UserView } from '../../dto';
import { AuthSpecification } from '../../specifications';
import { AuthTransaction } from '../transaction-manager.port';

const USERS_READ_REPOSITORY = Symbol.for('USERS_READ_REPOSITORY');

interface UserReadRepository {
  getOneUser(specifications: AuthSpecification, trx?: AuthTransaction): Promise<UserView | null>;
}

export { UserReadRepository, USERS_READ_REPOSITORY };
