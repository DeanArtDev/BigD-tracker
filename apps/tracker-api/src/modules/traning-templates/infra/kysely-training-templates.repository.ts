import { DB, KyselyService } from '@/infrastructure/db';
import { TrainingType } from '@/modules/tranings';
import { Injectable } from '@nestjs/common';
import {
  TrainingTemplateRawData,
  TrainingTemplatesRepository,
} from '../application/training-templates.repository';
import { TrainingTemplateEntity } from '../domain/entities';
import { ExpressionBuilder } from 'kysely';

@Injectable()
export class KyselyTrainingTemplatesRepository implements TrainingTemplatesRepository {
  constructor(private kyselyService: KyselyService) {}

  async findOneById({ id }: { id: number }): Promise<TrainingTemplateEntity | null> {
    const result = await this.kyselyService.db
      .selectFrom('trainings_templates')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async find(filters: { userId?: number; onlyUser?: boolean }): Promise<TrainingTemplateEntity[]> {
    let query = this.kyselyService.db
      .selectFrom('trainings_templates')
      .orderBy('created_at', 'desc')
      .selectAll();

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
  ): Promise<TrainingTemplateEntity | null> {
    const { replace } = options;

    const result = await this.kyselyService.db
      .updateTable('trainings_templates')
      .where('id', '=', data.id)
      .set({
        name: data.name,
        type: data.type,
        user_id: data.user_id,
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
  ): Promise<TrainingTemplateEntity | null> {
    const result = await this.kyselyService.db
      .insertInto('trainings_templates')
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

  async delete({ id }: { id: number }): Promise<boolean> {
    const result = await this.kyselyService.db
      .deleteFrom('trainings_templates')
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
