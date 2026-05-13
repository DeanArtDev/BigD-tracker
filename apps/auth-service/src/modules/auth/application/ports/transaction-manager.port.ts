import { DB } from '@/infrastructure/types';
import { IKyselyPostgresDB } from '@big-d/database';
import { Transaction } from 'kysely';

type AuthDB = Pick<DB, 'sessions' | 'users' | 'user_types'>;

type AuthDatabase = IKyselyPostgresDB<AuthDB>;

type AuthTransaction = Transaction<AuthDB>;

export { AuthDatabase, AuthTransaction, AuthDB };
