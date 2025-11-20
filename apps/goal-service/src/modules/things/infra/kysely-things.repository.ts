import { DB } from '@/infrastructure/types';
import { Priority, WeekDays } from '@/modules/things/domain';
import { BaseRepository, DateVo, Name, Result } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { ThingRawData, ThingsRepository } from '../application';
import { ThingEntity } from '../domain/thing.entity';

@Injectable()
export class KyselyThingsRepository extends BaseRepository<DB> implements ThingsRepository {
  #tableName = 'things' as const;
  constructor(@Inject(DATABASE_CONNECTION) private readonly database: Database<DB>) {
    super(database);
  }

  async findById(input: { id: number; userId: number }): Promise<ThingEntity | null> {
    const result = await this.db()
      .selectFrom(this.#tableName)
      .where('id', '=', input.id)
      .where('user_id', '=', input.userId)
      .selectAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async findByFilters({
    userId,
    from,
    to,
  }: {
    userId: number;
    from?: string;
    to?: string;
  }): Promise<ThingEntity[]> {
    let query = this.db().selectFrom(this.#tableName).selectAll().orderBy('start_date', 'asc');

    query = query.where((eb) => {
      const conditions = [eb('user_id', '=', userId)];

      if (from != null && to != null) {
        conditions.push(eb('start_date', '<=', new Date(to)));
        conditions.push(eb('deadline', '>=', new Date(from)));
        return eb.and(conditions);
      }

      if (to != null) {
        conditions.push(eb('deadline', '<=', new Date(to)));
      }

      if (from != null) {
        conditions.push(eb('start_date', '>=', new Date(from)));
      }

      return eb.and(conditions);
    });

    const result = await query.execute();

    return result.map(this.#map);
  }

  async findRepeatable(input: { userId: number }): Promise<ThingEntity[]> {
    let query = this.db().selectFrom(this.#tableName).selectAll();

    query = query.where((eb) => {
      const conditions = [
        eb('user_id', '=', input.userId),
        eb('end_date', 'is', null),
        eb('start_date', 'is', null),
        eb('description', 'is', null),
      ];
      return eb.and(conditions);
    });

    const result = await query.execute();
    return result.map(this.#map);
  }

  async findByGroupId(input: { groupId: number; userId: number }): Promise<ThingEntity[]> {
    const result = await this.db()
      .selectFrom(this.#tableName)
      .where('user_id', '=', input.userId)
      .where('group_id', '=', input.groupId)
      .orderBy('position', 'asc')
      .selectAll()
      .execute();

    return result.map(this.#map);
  }

  async create(entity: ThingEntity, trx?: Transaction<DB>): Promise<ThingEntity | null> {
    const result = await this.db(trx)
      .insertInto(this.#tableName)
      .values({
        user_id: entity.userId,
        comment: entity.comment,
        deadline: entity.deadline,
        week_days: entity.weekDays,
        description: entity.description,
        name: entity.name,
        position: entity.position,
        end_date: entity.endDate,
        group_id: entity.groupId,
        priority: entity.priority,
        result: entity.result,
        start_date: entity.startDate,
      })
      .returningAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async update(
    entity: ThingEntity,
    options: { replace: boolean } = { replace: false },
    trx?: Transaction<DB>,
  ): Promise<ThingEntity | null> {
    const { replace } = options;

    const result = await this.db(trx)
      .updateTable(this.#tableName)
      .where('id', '=', entity.id)
      .set({
        name: entity.name,
        group_id: entity.groupId,
        position: entity.position,
        comment: entity.comment ?? (replace ? null : undefined),
        deadline: entity.deadline ?? (replace ? null : undefined),
        week_days: entity.weekDays ?? (replace ? null : undefined),
        description: entity.description ?? (replace ? null : undefined),
        end_date: entity.endDate ?? (replace ? null : undefined),
        priority: entity.priority ?? (replace ? null : undefined),
        result: entity.result,
        start_date: entity.startDate ?? (replace ? null : undefined),
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

  async deleteByGroupId(
    input: { groupIds: number[]; userId: number },
    trx?: Transaction<DB>,
  ): Promise<number> {
    const result = await this.db(trx)
      .deleteFrom(this.#tableName)
      .where('group_id', 'in', input.groupIds)
      .where('user_id', '=', input.userId)
      .executeTakeFirst();

    return Number(result.numDeletedRows ?? 0);
  }

  #map = (raw: ThingRawData['selectable']): ThingEntity => {
    return ThingEntity.restore({
      id: raw.id,
      userId: raw.user_id,
      groupId: raw.group_id ?? undefined,
      name: Name.restore(raw.name),
      position: raw.position,
      comment: raw.comment ?? undefined,
      result: Result.restore(raw.result),
      weekDays: raw.week_days ? WeekDays.restore(raw.week_days) : undefined,
      deadline: raw.deadline ? DateVo.restore(raw.deadline.toISOString()) : undefined,
      endDate: raw.end_date ? DateVo.restore(raw.end_date.toISOString()) : undefined,
      startDate: raw.start_date ? DateVo.restore(raw.start_date.toISOString()) : undefined,
      description: raw.description ?? undefined,
      priority: raw.priority ? Priority.restore(raw.priority) : undefined,
    });
  };
}
