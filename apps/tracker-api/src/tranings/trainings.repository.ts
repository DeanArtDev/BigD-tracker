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

  async getAllByFilters(filters: {
    to?: string;
    from?: string;
    userId: number;
    templates?: boolean;
  }) {
    const { from, to, templates = false, userId } = filters;

    let query = this.kyselyService.db
      .selectFrom('trainings')
      .where('user_id', '=', userId)
      .selectAll();

    if (from != null && to != null) {
      query = query.where((eb) => {
        return eb.and([
          eb('start_date', 'is not', null),
          eb('start_date', '>=', new Date(from)),
          eb('start_date', '<=', new Date(to)),
        ]);
      });
    }

    if (templates) {
      query = query.where('start_date', 'is', null);
    }

    return await query.orderBy('created_at', 'desc').execute();
  }

  async update(data: {
    id: number;
    name?: string;
    type?: TrainingType;
    description?: string;
    startDate?: string;
    endDate?: string;
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
      startDate: string;
      endDate: string;
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
    startDate?: string;
    endDate?: string;
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
