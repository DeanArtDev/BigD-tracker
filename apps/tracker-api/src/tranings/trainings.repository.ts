import { Injectable } from '@nestjs/common';
import { KyselyService } from '@shared/modules/db';
import { Nullable } from 'kysely/dist/esm';
import { TrainingType } from './dtos/training.dto';

@Injectable()
export class TrainingsRepository {
  constructor(private kyselyService: KyselyService) {}

  async findOneById({ id }: { id: number }) {
    return await this.kyselyService.db
      .selectFrom('trainings')
      .where('id', '=', id)
      .selectAll()
      .execute();
  }

  async delete({ id }: { id: number }) {
    const result = await this.kyselyService.db
      .deleteFrom('trainings')
      .where('id', '=', id)
      .executeTakeFirst();
    return result.numDeletedRows > 0;
  }

  async getAllByUserId(
    { userId }: { userId: number },
    options?: { filters: { templates?: boolean } },
  ) {
    const { filters } = options ?? {};
    const { templates = false } = filters ?? {};

    const query = this.kyselyService.db
      .selectFrom('trainings')
      .selectAll()
      .where('user_id', '=', userId);

    if (templates) {
      query.where('start_date', 'is', null);
    }

    return await query.orderBy('created_at', 'desc').execute();
  }

  async update(data: {
    id: number;
    name?: string;
    type?: TrainingType;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    wormUpDuration?: number;
    postTrainingDuration?: number;
  }) {
    return await this.kyselyService.db
      .updateTable('trainings')
      .where('id', '=', data.id)
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

  async updateFully(
    data: { id: number; type: TrainingType; name: string } & Nullable<{
      description: string;
      startDate: Date;
      endDate: Date;
      wormUpDuration: number;
      postTrainingDuration: number;
    }>,
  ) {
    return await this.kyselyService.db
      .updateTable('trainings')
      .where('id', '=', data.id)
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

  async create(data: {
    userId: number;
    name: string;
    type: TrainingType;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    wormUpDuration?: number;
    postTrainingDuration?: number;
  }) {
    return await this.kyselyService.db
      .insertInto('trainings')
      .values({
        user_id: data.userId,
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
}
