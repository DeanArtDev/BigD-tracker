import { Injectable } from '@nestjs/common';
import { KyselyService } from '@/infrastructure/db';
import { TrainingEntity } from '@/modules/tranings/domain/entities/training.entity';
import {
  TrainingRawData,
  TrainingsRepository,
  TrainingType,
} from '../application/trainings.repository';

@Injectable()
export class KyselyTrainingsRepository implements TrainingsRepository {
  constructor(private kyselyService: KyselyService) {}

  async findOneById({ id }: { id: number }): Promise<TrainingEntity | null> {
    const result = await this.kyselyService.db
      .selectFrom('trainings')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async find({
    userId,
    from,
    to,
  }: {
    userId: number;
    from?: string;
    to?: string;
  }): Promise<TrainingEntity[]> {
    let query = this.kyselyService.db
      .selectFrom('trainings')
      .orderBy('created_at', 'desc')
      .selectAll();

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
  ): Promise<TrainingEntity | null> {
    const { replace } = options;

    const result = await this.kyselyService.db
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

  async create(data: TrainingRawData['insertable']): Promise<TrainingEntity | null> {
    const result = await this.kyselyService.db
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

  async delete({ id }: { id: number }): Promise<boolean> {
    const result = await this.kyselyService.db
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
