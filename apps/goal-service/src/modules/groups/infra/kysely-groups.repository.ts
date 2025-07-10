import { DB } from '@/infrastructure/types';
import { IN_BOX_NAME } from '@/modules/groups/application/commands';
import { GroupEntity } from '@/modules/groups/domain';
import { BaseRepository, Name, Result } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { GroupRawData, GroupsRepository } from '../application';

@Injectable()
export class KyselyGroupsRepository extends BaseRepository<DB> implements GroupsRepository {
  #tableName = 'groups' as const;
  constructor(@Inject(DATABASE_CONNECTION) private readonly database: Database<DB>) {
    super(database);
  }

  async findById(input: { id: number; userId: number }): Promise<GroupEntity | null> {
    const result = await this.db()
      .selectFrom(this.#tableName)
      .where('id', '=', input.id)
      .where('user_id', '=', input.userId)
      .selectAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async findUserInbox(input: { userId: number }): Promise<GroupEntity | null> {
    const result = await this.db()
      .selectFrom(this.#tableName)
      .where('user_id', '=', input.userId)
      .where('name', '=', IN_BOX_NAME)
      .selectAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async findByGoalId(input: { goalId: number; userId: number }): Promise<GroupEntity[]> {
    const result = await this.db()
      .selectFrom(this.#tableName)
      .where('user_id', '=', input.userId)
      .where('goal_id', '=', input.goalId)
      .selectAll()
      .execute();

    return result.map(this.#map);
  }

  async create(entity: GroupEntity, trx?: Transaction<DB>): Promise<GroupEntity | null> {
    const result = await this.db(trx)
      .insertInto(this.#tableName)
      .values({
        user_id: entity.userId,
        description: entity.description,
        name: entity.name,
        result: entity.result,
        goal_id: entity.goalId,
        position: entity.position,
      })
      .returningAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async update(
    entity: GroupEntity,
    options: { replace: boolean } = { replace: false },
    trx?: Transaction<DB>,
  ): Promise<GroupEntity | null> {
    const { replace } = options;

    const result = await this.db(trx)
      .updateTable(this.#tableName)
      .where('id', '=', entity.id)
      .set({
        name: entity.name,
        position: entity.position,
        description: entity.description ?? (replace ? null : undefined),
        result: entity.result ?? (replace ? null : undefined),
        updated_at: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async upsert(
    entity: GroupEntity,
    options: { replace: boolean } = { replace: false },
    trx?: Transaction<DB>,
  ): Promise<GroupEntity | null> {
    const { replace } = options;

    const result = await this.db(trx)
      .insertInto(this.#tableName)
      .values({
        id: entity.id,
        user_id: entity.userId,
        description: entity.description,
        name: entity.name,
        result: entity.result,
        goal_id: entity.goalId,
        position: entity.position,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          name: entity.name,
          position: entity.position,
          description: entity.description ?? (replace ? null : undefined),
          result: entity.result ?? (replace ? null : undefined),
          updated_at: new Date().toISOString(),
        }),
      )
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

  #map = (raw: GroupRawData['selectable']): GroupEntity => {
    return GroupEntity.restore({
      id: raw.id,
      position: raw.position,
      userId: raw.user_id,
      name: Name.restore(raw.name),
      goalId: raw.goal_id ?? undefined,
      description: raw.description ?? undefined,
      result: Result.restore(raw.result),
    });
  };
}
