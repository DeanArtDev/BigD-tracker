import { TrainingRawData } from '@/tranings/trainings.mapper';
import { Injectable } from '@nestjs/common';
import { Override } from '@shared/lib/type-helpers';
import { KyselyService } from '@shared/modules/db';
import { TrainingType } from './dtos/training.dto';

@Injectable()
export class TrainingsRepository {
  constructor(private kyselyService: KyselyService) {}

  async findOneById({ id }: { id: number }) {
    return await this.kyselyService.db
      .selectFrom('trainings')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }

  async findByUserId({ userId }: { userId: number }) {
    return await this.kyselyService.db
      .selectFrom('trainings')
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .selectAll()
      .execute();
  }

  async findByRangeForUser(filters: { userId: number; to?: string; from?: string }) {
    const { userId, from, to } = filters;

    let query = this.kyselyService.db
      .selectFrom('trainings')
      .where('user_id', '=', userId)
      .selectAll();

    if (from != null && to != null) {
      query = query.where((eb) => {
        return eb.and([
          eb('start_date', '>=', new Date(from)),
          eb('start_date', '<=', new Date(to)),
        ]);
      });
    }

    return await query.orderBy('created_at', 'desc').execute();
  }

  async updatePartly(
    id: number,
    data: {
      name?: string;
      type?: TrainingType;
      startDate?: string;
      description?: string;
      endDate?: string;
      wormUpDuration?: number;
      postTrainingDuration?: number;
    },
  ) {
    return await this.kyselyService.db
      .updateTable('trainings')
      .where('id', '=', id)
      .set({
        name: data.name,
        type: data.type,
        description: data.description,
        start_date: data.startDate,
        end_date: data.endDate,
        worm_up_duration: data.wormUpDuration,
        post_training_duration: data.postTrainingDuration,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async update(
    data: Override<TrainingRawData['updateable'], 'id', number>,
    options: { replace: boolean } = { replace: false },
  ) {
    const { replace } = options;

    return await this.kyselyService.db
      .updateTable('trainings')
      .where('id', '=', data.id)
      .set({
        name: data.name,
        type: data.type,
        description: data.description ?? (replace ? null : undefined),
        start_date: data.start_date,
        end_date: data.end_date,
        worm_up_duration: data.worm_up_duration ?? (replace ? null : undefined),
        post_training_duration: data.post_training_duration ?? (replace ? null : undefined),
      })
      .returningAll()
      .executeTakeFirst();
  }

  async create(data: TrainingRawData['insertable']) {
    return await this.kyselyService.db
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
  }

  async delete({ id }: { id: number }) {
    const result = await this.kyselyService.db
      .deleteFrom('trainings')
      .where('id', '=', id)
      .executeTakeFirst();
    return result.numDeletedRows > 0;
  }
}
