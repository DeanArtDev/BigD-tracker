import { Injectable } from '@nestjs/common';
import { DB, KyselyService } from '@shared/modules/db';
import { ExpressionBuilder, Nullable } from 'kysely';
import { TrainingType } from './dtos/training.dto';

@Injectable()
export class TrainingsTemplatesRepository {
  constructor(private kyselyService: KyselyService) {}

  async findOneById({ id }: { id: number }) {
    return await this.kyselyService.db
      .selectFrom('trainings_templates')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }

  async findByFilters(
    filters: {
      userId?: number;
    } = {},
  ) {
    let query = this.kyselyService.db
      .selectFrom('trainings_templates')
      .orderBy('created_at', 'desc')
      .selectAll();

    const { userId } = filters;
    query = query.where((eb) => {
      const conditions: ReturnType<ExpressionBuilder<DB, 'trainings_templates'>>[] = [];
      if (userId != null) {
        conditions.push(eb('user_id', '=', userId));
      }
      return eb.and(conditions);
    });

    return await query.execute();
  }

  async findByUserId({ userId }: { userId: number }) {
    return await this.kyselyService.db
      .selectFrom('trainings_templates')
      .where('user_id', '=', userId)
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute();
  }

  async delete({ id }: { id: number }) {
    const result = await this.kyselyService.db
      .deleteFrom('trainings_templates')
      .where('id', '=', id)
      .executeTakeFirst();
    return result.numDeletedRows > 0;
  }

  async updateAndReplace(
    id: number,
    data: { name: string; type: TrainingType } & Nullable<{
      description: string;
      wormUpDuration: number;
      postTrainingDuration: number;
    }>,
  ) {
    return await this.kyselyService.db
      .updateTable('trainings_templates')
      .where('id', '=', id)
      .set({
        name: data.name,
        type: data.type,
        description: data.description,
        worm_up_duration: data.wormUpDuration,
        post_training_duration: data.postTrainingDuration,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async create(data: {
    userId?: number;
    name: string;
    type: TrainingType;
    description?: string;
    wormUpDuration?: number;
    postTrainingDuration?: number;
  }) {
    return await this.kyselyService.db
      .insertInto('trainings_templates')
      .values({
        user_id: data.userId,
        name: data.name,
        type: data.type,
        description: data.description,
        worm_up_duration: data.wormUpDuration,
        post_training_duration: data.postTrainingDuration,
      })
      .returningAll()
      .executeTakeFirst();
  }
}
