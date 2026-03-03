import { DB } from '@/infrastructure/types';
import { BaseRepository, DateVo } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { set } from 'date-fns';
import { Transaction } from 'kysely';
import { AuthRawData, AuthRepository } from '../application';
import { SessionEntity } from '../domain';

@Injectable()
export class KyselyAuthRepository extends BaseRepository<DB> implements AuthRepository {
  constructor(@Inject(DATABASE_CONNECTION) readonly database: Database<DB>) {
    super(database);
  }

  async findByToken(token: string, trx?: Transaction<DB>): Promise<SessionEntity | null> {
    const result = await this.db(trx).selectFrom('sessions').where('token', '=', token).selectAll().executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async findByUserId(id: number, trx?: Transaction<DB>): Promise<SessionEntity | null> {
    const result = await this.db(trx).selectFrom('sessions').where('user_id', '=', id).selectAll().executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async findAnd(input: { userId: number; userAgent?: string }, trx?: Transaction<DB>): Promise<SessionEntity | null> {
    let query = this.db(trx).selectFrom('sessions').selectAll();

    query = query.where((eb) => {
      const conditions = [eb('user_id', '=', input.userId)];

      if (input.userAgent != null) {
        conditions.push(eb('user_agent', '=', input.userAgent));
      }

      return eb.and(conditions);
    });

    const result = await query.executeTakeFirst();
    if (result == null) return null;
    return this.#map(result);
  }

  async delete(input: { userId: number; userAgent?: string }, trx?: Transaction<DB>): Promise<boolean> {
    let query = this.db(trx).deleteFrom('sessions');

    query = query.where((eb) => {
      const conditions = [eb('user_id', '=', input.userId)];

      if (input.userAgent != null) {
        conditions.push(eb('user_agent', '=', input.userAgent));
      }

      return eb.and(conditions);
    });

    const result = await query.executeTakeFirst();

    return result.numDeletedRows > 0;
  }

  async deleteExpired() {
    const today = set(new Date().toISOString(), {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    await this.db().deleteFrom('sessions').where('expires_at', '<', today).execute();
  }

  async create(data: SessionEntity, trx?: Transaction<DB>): Promise<SessionEntity | null> {
    const result = await this.db(trx)
      .insertInto('sessions')
      .values({
        uuid: data.uuid,
        token: data.token,
        revoked: data.revoked,
        ip: data.ip,
        user_agent: data.userAgent,
        user_id: data.userId,
        expires_at: data.expiresAt,
      })
      .returningAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  #map = (raw: AuthRawData['selectable']): SessionEntity => {
    return SessionEntity.restore({
      uuid: raw.uuid,
      token: raw.token,
      revoked: raw.revoked,
      userId: raw.user_id,
      expiresAt: DateVo.restore(raw.expires_at.toISOString()),
      ip: raw.ip ?? undefined,
      userAgent: raw.user_agent ?? undefined,
    });
  };
}
