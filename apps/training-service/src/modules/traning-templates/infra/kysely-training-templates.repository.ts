import { TrainingType } from '@big-d/api-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ExpressionBuilder, Transaction } from 'kysely';
import { TrainingTemplateRawData, TrainingTemplatesRepository } from '../application/repositories';
import { TrainingTemplateEntity } from '../domain/entities';
import { BaseRepository } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION, DB } from '@big-d/database';

@Injectable()
export class KyselyTrainingTemplatesRepository
  extends BaseRepository<DB>
  implements TrainingTemplatesRepository
{
  private tableName = 'trainings_templates' as const;

  constructor(@Inject(DATABASE_CONNECTION) readonly database: Database<DB>) {
    super(database);
  }

  async findOneById(
    { id }: { id: number },
    trx?: Transaction<DB>,
  ): Promise<TrainingTemplateEntity | null> {
    const result = await this.db(trx)
      .selectFrom(this.tableName)
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async find(
    filters: { userId?: number; onlyUser?: boolean },
    trx?: Transaction<DB>,
  ): Promise<TrainingTemplateEntity[]> {
    let query = this.db(trx).selectFrom(this.tableName).orderBy('created_at', 'desc').selectAll();

    query = query.where((eb) => {
      const { userId, onlyUser = false } = filters;
      const conditions: ReturnType<ExpressionBuilder<DB, 'trainings_templates'>>[] = [];

      if (userId != null) {
        if (onlyUser) {
          conditions.push(eb('user_id', '=', userId));
        } else {
          conditions.push(eb.or([eb('user_id', 'is', null), eb('user_id', '=', userId)]));
        }
      }

      return eb.and(conditions);
    });

    const result = await query.execute();

    return result.map(this.#map);
  }

  async update(
    data: TrainingTemplateRawData['updateable'],
    options: { replace: boolean } = { replace: false },
    trx?: Transaction<DB>,
  ): Promise<TrainingTemplateEntity | null> {
    const { replace } = options;

    const result = await this.db(trx)
      .updateTable(this.tableName)
      .where('id', '=', data.id)
      .set({
        name: data.name,
        type: data.type,
        description: data.description ?? (replace ? null : undefined),
        worm_up_duration: data.worm_up_duration ?? (replace ? null : undefined),
        post_training_duration: data.post_training_duration ?? (replace ? null : undefined),
        updated_at: new Date(),
      })
      .returningAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async create(
    data: TrainingTemplateRawData['insertable'],
    trx?: Transaction<DB>,
  ): Promise<TrainingTemplateEntity | null> {
    const result = await this.db(trx)
      .insertInto(this.tableName)
      .values({
        user_id: data.user_id,
        name: data.name,
        type: data.type,
        description: data.description,
        worm_up_duration: data.worm_up_duration,
        post_training_duration: data.post_training_duration,
      })
      .returningAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async upsert(
    input: TrainingTemplateRawData['insertable'] & { id: number },
    options: { replace: boolean } = { replace: false },
    trx?: Transaction<DB>,
  ): Promise<TrainingTemplateEntity | null> {
    const { replace } = options;

    const result = await this.db(trx)
      .insertInto(this.tableName)
      .values({
        id: input.id,
        type: input.type,
        name: input.name,
        user_id: input.user_id,
        description: input.description,
        worm_up_duration: input.worm_up_duration,
        post_training_duration: input.post_training_duration,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          type: input.type,
          name: input.name,
          worm_up_duration: input.worm_up_duration ?? (replace ? null : undefined),
          post_training_duration: input.post_training_duration ?? (replace ? null : undefined),
          description: input.description ?? (replace ? null : undefined),
          updated_at: new Date(),
        }),
      )
      .returningAll()
      .executeTakeFirst();

    if (result == null) return null;

    return this.#map(result);
  }

  async delete({ id }: { id: number }, trx?: Transaction<DB>): Promise<boolean> {
    const result = await this.db(trx)
      .deleteFrom(this.tableName)
      .where('id', '=', id)
      .executeTakeFirst();

    return result.numDeletedRows > 0;
  }

  #map = (raw: TrainingTemplateRawData['selectable']): TrainingTemplateEntity => {
    return TrainingTemplateEntity.restore({
      id: raw.id,
      name: raw.name,
      type: raw.type as TrainingType,
      userId: raw.user_id ?? undefined,
      description: raw.description ?? undefined,
      postTrainingDuration: raw.post_training_duration ?? undefined,
      wormUpDuration: raw.worm_up_duration ?? undefined,
    });
  };
}
