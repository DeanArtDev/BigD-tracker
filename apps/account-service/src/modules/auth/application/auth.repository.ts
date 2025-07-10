import { DB } from '@/infrastructure/types';
import { SessionEntity } from '@/modules/auth/domain';
import { Selectable, Transaction } from 'kysely';

interface AuthRawData {
  readonly selectable: Omit<Selectable<DB['sessions']>, 'updated_at' | 'created_at'>;
}

const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

interface AuthRepository {
  findByToken(token: string, trx?: Transaction<DB>): Promise<SessionEntity | null>;
  findByUserId(id: number, trx?: Transaction<DB>): Promise<SessionEntity | null>;
  findAnd(
    input: { userId: number; userAgent?: string },
    trx?: Transaction<DB>,
  ): Promise<SessionEntity | null>;
  create(input: SessionEntity, trx?: Transaction<DB>): Promise<SessionEntity | null>;
  delete(input: { userId: number; userAgent?: string }, trx?: Transaction<DB>): Promise<boolean>;
  deleteExpired(): Promise<void>;
}

export { AuthRawData, AuthRepository, AUTH_REPOSITORY };
