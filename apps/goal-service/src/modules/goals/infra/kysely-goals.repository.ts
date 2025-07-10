import { DB } from '@/infrastructure/types';
import { GoalRawData, GoalsRepository } from '@/modules/goals/application';
import { GoalEntity } from '@/modules/goals/domain';
import { BaseRepository, DateVo, Name, Result } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

@Injectable()
export class KyselyGoalsRepository extends BaseRepository<DB> implements GoalsRepository {
  #tableName = 'goals' as const;
  constructor(@Inject(DATABASE_CONNECTION) private readonly database: Database<DB>) {
    super(database);
  }

  async findById(input: { id: number; userId: number }): Promise<GoalEntity | null> {
    const result = await this.db()
      .selectFrom(this.#tableName)
      .where('id', '=', input.id)
      .where('user_id', '=', input.userId)
      .selectAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async findAllByUserId(input: { userId: number }): Promise<GoalEntity[]> {
    const result = await this.db()
      .selectFrom(this.#tableName)
      .where('user_id', '=', input.userId)
      .selectAll()
      .execute();

    return result.map(this.#map);
  }

  async create(entity: GoalEntity, trx?: Transaction<DB>): Promise<GoalEntity | null> {
    const result = await this.db(trx)
      .insertInto(this.#tableName)
      .values({
        user_id: entity.userId,
        description: entity.description,
        name: entity.name,
        result: entity.result,
        deadline: entity.deadline,
        start_date: entity.startDate,
      })
      .returningAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async update(
    entity: GoalEntity,
    options: { replace: boolean } = { replace: false },
    trx?: Transaction<DB>,
  ): Promise<GoalEntity | null> {
    const { replace } = options;

    const result = await this.db(trx)
      .updateTable(this.#tableName)
      .where('id', '=', entity.id)
      .set({
        name: entity.name,
        start_date: entity.startDate,
        end_date: entity.endDate,
        deadline: entity.deadline,
        result: entity.result,
        description: entity.description ?? (replace ? null : undefined),
        updated_at: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async delete(input: { id: number; userId: number }, trx?: Transaction<DB>): Promise<boolean> {
    const result = await this.db(trx)
      .deleteFrom(this.#tableName)
      .where('id', '=', input.id)
      .where('user_id', '=', input.userId)
      .executeTakeFirst();

    return result.numDeletedRows > 0;
  }

  #map = (raw: GoalRawData['selectable']): GoalEntity => {
    return GoalEntity.restore({
      id: raw.id,
      userId: raw.user_id,
      name: Name.restore(raw.name),
      result: Result.restore(raw.result),
      description: raw.description ?? undefined,
      deadline: raw.deadline ? DateVo.restore(raw.deadline.toISOString()) : undefined,
      endDate: raw.end_date ? DateVo.restore(raw.end_date.toISOString()) : undefined,
      startDate: raw.start_date ? DateVo.restore(raw.start_date.toISOString()) : undefined,
    });
  };
}
