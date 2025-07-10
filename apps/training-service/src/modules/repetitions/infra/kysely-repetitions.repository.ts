import { BaseRepository } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION } from '@big-d/database';
import { DB } from '@infrastructure/types';
import { Inject, Injectable } from '@nestjs/common';
import { ExpressionBuilder, Transaction } from 'kysely';
import {
  RepetitionFinishType,
  RepetitionRawData,
  RepetitionsRepository,
} from '../application/repetitions.repository';
import { RepetitionEntity } from '../domain/repetition.entity';

@Injectable()
export class KyselyRepetitionsRepository
  extends BaseRepository<DB>
  implements RepetitionsRepository
{
  constructor(@Inject(DATABASE_CONNECTION) readonly database: Database<DB>) {
    super(database);
  }

  async createMany(
    data: RepetitionRawData['insertable'][],
    trx?: Transaction<DB>,
  ): Promise<RepetitionEntity[]> {
    const result = await this.db(trx)
      .insertInto('repetitions')
      .values(data)
      .returningAll()
      .execute();
    return result.map(this.#map);
  }

  async update(
    { id, ...data }: RepetitionRawData['updateable'],
    trx?: Transaction<DB>,
  ): Promise<RepetitionEntity | null> {
    const result = await this.db(trx)
      .updateTable('repetitions')
      .where('id', '=', id)
      .set({ ...data, updated_at: new Date() })
      .returningAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async findOneById(id: number, trx?: Transaction<DB>): Promise<RepetitionEntity | null> {
    const result = await this.db(trx)
      .selectFrom('repetitions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (result == null) return null;

    return this.#map(result);
  }

  async findAllByFilters(
    filters: {
      exerciseId: number;
      userId?: number | null;
      positionOrder?: 'asc' | 'desc';
    },
    trx?: Transaction<DB>,
  ): Promise<RepetitionEntity[]> {
    const { userId, exerciseId, positionOrder = 'asc' } = filters;
    let query = this.db(trx)
      .selectFrom('repetitions')
      .orderBy('position', positionOrder)
      .selectAll();

    query = query.where((eb) => {
      const conditions: ReturnType<ExpressionBuilder<DB, 'repetitions'>>[] = [];

      if (exerciseId != null) {
        conditions.push(eb('exercise_id', '=', exerciseId));
      }

      if (userId != null) {
        conditions.push(eb('user_id', '=', userId));
      } else if (userId === null) {
        conditions.push(eb('user_id', 'is', null));
      }

      return eb.and(conditions);
    });

    const result = await query.execute();
    return result.map(this.#map);
  }

  async findTemplatables(trx?: Transaction<DB>): Promise<RepetitionEntity[]> {
    const result = await this.db(trx)
      .selectFrom('repetitions')
      .where('user_id', 'is', null)
      .selectAll()
      .execute();

    return result.map(this.#map);
  }

  async deleteMany(ids: number[], trx?: Transaction<DB>): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await this.db(trx)
      .deleteFrom('repetitions')
      .where('id', 'in', ids)
      .executeTakeFirst();
    return Number(result.numDeletedRows ?? 0);
  }

  async deleteByExerciseIds(ids: number[], trx?: Transaction<DB>): Promise<number> {
    const result = await this.db(trx)
      .deleteFrom('repetitions')
      .where('exercise_id', 'in', ids)
      .executeTakeFirst();

    return Number(result.numDeletedRows ?? 0);
  }

  #map = (raw: RepetitionRawData['selectable']): RepetitionEntity => {
    return RepetitionEntity.restore({
      id: raw.id,
      exerciseId: raw.exercise_id,
      factBreak: raw.fact_break ?? undefined,
      factWeight: raw.fact_weight ?? undefined,
      userId: raw.user_id ?? undefined,
      factCount: raw.fact_count ?? undefined,
      targetWeight: raw.target_weight,
      finishType: (raw.finish_type as RepetitionFinishType) ?? undefined,
      targetBreak: raw.target_break,
      targetCount: raw.target_count,
      description: raw.description ?? undefined,
      position: raw.position,
    });
  };
}
