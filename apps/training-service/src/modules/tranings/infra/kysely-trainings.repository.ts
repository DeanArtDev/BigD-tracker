import { BaseRepository } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION, DB } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TrainingEntity } from '@modules/tranings/domain';
import {
  TrainingRawData,
  TrainingsRepository,
  TrainingType,
} from '../application/trainings.repository';
import { set } from 'date-fns';
import { Transaction } from 'kysely';

@Injectable()
export class KyselyTrainingsRepository extends BaseRepository<DB> implements TrainingsRepository {
  constructor(@Inject(DATABASE_CONNECTION) readonly database: Database<DB>) {
    super(database);
  }

  async findOneById({ id }: { id: number }, trx?: Transaction<DB>): Promise<TrainingEntity | null> {
    const result = await this.db(trx)
      .selectFrom('trainings')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async findActive(trx?: Transaction<DB>): Promise<TrainingEntity | null> {
    const today = set(new Date().toISOString(), {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    const tomorrow = set(today, { date: today.getDate() + 1 });

    let query = this.db(trx).selectFrom('trainings').selectAll();

    query = query.where((eb) => {
      const conditions = [
        eb('end_date', 'is', null),
        eb('start_date', '>=', today),
        eb('start_date', '<', tomorrow),
      ];

      return eb.and(conditions);
    });

    const result = await query.executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async find(
    {
      userId,
      from,
      to,
    }: {
      userId: number;
      from?: string;
      to?: string;
    },
    trx?: Transaction<DB>,
  ): Promise<TrainingEntity[]> {
    let query = this.db(trx).selectFrom('trainings').orderBy('created_at', 'desc').selectAll();

    query = query.where((eb) => {
      const conditions = [eb('user_id', '=', userId)];

      if (from != null && to != null) {
        conditions.push(eb('start_date', '>=', new Date(from)));
        conditions.push(eb('start_date', '<=', new Date(to)));
      }
      return eb.and(conditions);
    });

    const result = await query.execute();

    return result.map(this.#map);
  }

  async update(
    data: TrainingRawData['updateable'],
    options: { replace: boolean } = { replace: false },
    trx?: Transaction<DB>,
  ): Promise<TrainingEntity | null> {
    const { replace } = options;

    const result = await this.db(trx)
      .updateTable('trainings')
      .where('id', '=', data.id)
      .set({
        name: data.name,
        type: data.type,
        user_id: data.user_id,
        in_progress: data.in_progress,
        description: data.description ?? (replace ? null : undefined),
        start_date: data.start_date,
        end_date: data.end_date,
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
    data: TrainingRawData['insertable'],
    trx?: Transaction<DB>,
  ): Promise<TrainingEntity | null> {
    const result = await this.db(trx)
      .insertInto('trainings')
      .values({
        user_id: data.user_id,
        name: data.name,
        type: data.type,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        worm_up_duration: data.worm_up_duration,
        post_training_duration: data.post_training_duration,
      })
      .returningAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async delete({ id }: { id: number }, trx?: Transaction<DB>): Promise<boolean> {
    const result = await this.db(trx)
      .deleteFrom('trainings')
      .where('id', '=', id)
      .executeTakeFirst();

    return result.numDeletedRows > 0;
  }

  #map = (raw: TrainingRawData['selectable']): TrainingEntity => {
    return TrainingEntity.restore({
      id: raw.id,
      name: raw.name,
      inProgress: raw.in_progress,
      type: raw.type as TrainingType,
      startDate: raw.start_date.toISOString(),
      endDate: raw.end_date?.toISOString() ?? undefined,
      userId: raw.user_id ?? undefined,
      description: raw.description ?? undefined,
      postTrainingDuration: raw.post_training_duration ?? undefined,
      wormUpDuration: raw.worm_up_duration ?? undefined,
    });
  };
}
