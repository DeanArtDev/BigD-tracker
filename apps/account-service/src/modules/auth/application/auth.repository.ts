import { SessionEntity } from '@/modules/auth/domain/session.entity';
import { OmitCreateFields } from '@big-d/api-utils';
import { DB } from '@big-d/database';
import { Insertable, Selectable, Transaction, Updateable } from 'kysely';

interface AuthRawData {
  readonly selectable: Omit<Selectable<DB['sessions']>, 'updated_at' | 'created_at'>;
  readonly updateable: Omit<Updateable<DB['sessions']>, 'updated_at' | 'created_at'>;
  readonly insertable: OmitCreateFields<Insertable<DB['sessions']>>;
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
