import { Injectable } from '@nestjs/common';
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
      .execute();
  }

  async delete({ id }: { id: number }) {
    const result = await this.kyselyService.db
      .deleteFrom('trainings')
      .where('id', '=', id)
      .executeTakeFirst();
    console.log(result);
    return result.numDeletedRows > 0;
  }

  async getAllByUserId({ userId }: { userId: number }) {
    return await this.kyselyService.db
      .selectFrom('trainings')
      .where('user_id', '=', userId)
      .selectAll()
      .execute();
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
    console.log({ data });
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
