import { ExerciseType } from '@big-d/api-contracts';
import { BaseRepository } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION, DB } from '@big-d/database';
import { ExerciseRawData, ExercisesRepository } from '@modules/exercises/application';
import { ExerciseEntity } from '@modules/exercises/domain';
import { Inject, Injectable } from '@nestjs/common';
import { ExpressionBuilder, Transaction } from 'kysely';

@Injectable()
export class KyselyExercisesRepository extends BaseRepository<DB> implements ExercisesRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly database: Database<DB>) {
    super(database);
  }

  async findOneById(id: number, trx?: Transaction<DB>): Promise<ExerciseEntity | null> {
    const result = await this.db(trx)
      .selectFrom('exercises')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (result == null) return null;

    return this.#map(result);
  }

  async findAllByIds(ids: number[], trx?: Transaction<DB>): Promise<ExerciseEntity[]> {
    const result = await this.db(trx)
      .selectFrom('exercises')
      .where('id', 'in', ids)
      .selectAll()
      .execute();
    return result.map(this.#map);
  }

  async findTemplatable(
    filters: { userId?: number; onlyUser?: boolean },
    trx?: Transaction<DB>,
  ): Promise<ExerciseEntity[]> {
    const { userId, onlyUser = false } = filters;
    let query = this.db(trx)
      .selectFrom('exercises')
      .orderBy('created_at', 'desc')

      .selectAll();

    query = query.where((eb) => {
      const commonFilters = [eb('training_id', 'is', null), eb('training_template_id', 'is', null)];

      const andConditions: ReturnType<ExpressionBuilder<DB, 'exercises'>>[] = [...commonFilters];

      if (userId != null) {
        if (onlyUser) {
          andConditions.push(eb('user_id', '=', userId));
        } else {
          andConditions.push(eb.or([eb('user_id', 'is', null), eb('user_id', '=', userId)]));
        }
      }

      return eb.and(andConditions);
    });

    const result = await query.execute();
    return result.map(this.#map);
  }

  async findAllByFilters(
    filters: {
      userId?: number;
      trainingId?: number;
      templateId?: number;
      positionOrder?: 'asc' | 'desc';
    },
    trx?: Transaction<DB>,
  ): Promise<ExerciseEntity[]> {
    const { userId, trainingId, templateId, positionOrder = 'asc' } = filters;

    let query = this.db(trx).selectFrom('exercises').orderBy('position', positionOrder).selectAll();

    query = query.where((eb) => {
      const andConditions: ReturnType<ExpressionBuilder<DB, 'exercises'>>[] = [];

      if (trainingId) {
        andConditions.push(eb('training_id', '=', trainingId));
      }

      if (templateId) {
        andConditions.push(eb('training_template_id', '=', templateId));
      }

      if (userId) {
        andConditions.push(eb('user_id', '=', userId));
      }

      return eb.and(andConditions);
    });

    const result = await query.execute();
    return result.map(this.#map);
  }

  async create(
    data: ExerciseRawData['insertable'],
    trx?: Transaction<DB>,
  ): Promise<ExerciseEntity | null> {
    const result = await this.db(trx)
      .insertInto('exercises')
      .values({
        type: data.type,
        name: data.name,
        user_id: data.user_id,
        description: data.description,
        example_url: data.example_url,
        training_template_id: data.training_template_id,
        training_id: data.training_id,
        position: data.position,
      })
      .returningAll()
      .executeTakeFirst();

    if (result == null) return null;

    return this.#map(result);
  }

  async update(
    data: ExerciseRawData['updateable'],
    options: { replace: boolean } = { replace: false },
    trx?: Transaction<DB>,
  ): Promise<ExerciseEntity | null> {
    const { replace } = options;

    const result = await this.db(trx)
      .updateTable('exercises')
      .where('id', '=', data.id)
      .set({
        type: data.type,
        name: data.name,
        updated_at: new Date(),
        user_id: data.user_id,
        training_id: data.training_id,
        training_template_id: data.training_template_id,
        description: data.description ?? (replace ? null : undefined),
        example_url: data.example_url ?? (replace ? null : undefined),
        position: data.position,
      })
      .returningAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async upsert(
    input: ExerciseRawData['insertable'] & { id: number },
    options: { replace: boolean } = { replace: false },
    trx?: Transaction<DB>,
  ): Promise<ExerciseEntity | null> {
    const { replace } = options;

    const result = await this.db(trx)
      .insertInto('exercises')
      .values({
        id: input.id,
        type: input.type,
        name: input.name,
        user_id: input.user_id,
        description: input.description,
        example_url: input.example_url,
        training_id: input.training_id,
        training_template_id: input.training_template_id,
        position: input.position,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          type: input.type,
          name: input.name,
          description: input.description ?? (replace ? null : undefined),
          example_url: input.example_url ?? (replace ? null : undefined),
          position: input.position,
          updated_at: new Date(),
        }),
      )
      .returningAll()
      .executeTakeFirst();

    if (result == null) return null;

    return this.#map(result);
  }

  async delete(id: number, trx?: Transaction<DB>): Promise<boolean> {
    const result = await this.db(trx)
      .deleteFrom('exercises')
      .where('id', '=', id)
      .executeTakeFirst();

    return result.numDeletedRows > 0;
  }

  #map = (raw: ExerciseRawData['selectable']): ExerciseEntity => {
    return ExerciseEntity.restore({
      id: raw.id,
      userId: raw.user_id ?? undefined,
      name: raw.name,
      type: raw.type as ExerciseType,
      description: raw.description ?? undefined,
      exampleUrl: raw.example_url ?? undefined,
      trainingId: raw.training_id ?? undefined,
      trainingTemplateId: raw.training_template_id ?? undefined,
      position: raw.position,
    });
  };
}
