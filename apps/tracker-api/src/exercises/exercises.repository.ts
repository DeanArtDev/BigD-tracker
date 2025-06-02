import { Injectable } from '@nestjs/common';
import { DB, KyselyService } from '@shared/modules/db';
import { ExpressionBuilder, Nullable } from 'kysely';
import { ExerciseType } from './entity/exercise.entity';

@Injectable()
export class ExercisesRepository {
  constructor(private kyselyService: KyselyService) {}

  async findOneById({ id }: { id: number }) {
    return await this.kyselyService.db
      .selectFrom('exercises')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }

  async findExercisesByFilters(
    filters: {
      userId?: number;
      trainingId?: number;
    } = {},
  ) {
    let query = this.kyselyService.db
      .selectFrom('exercises')
      .orderBy('created_at', 'desc')
      .selectAll();

    const { userId, trainingId } = filters;
    query = query.where((eb) => {
      const conditions: ReturnType<ExpressionBuilder<DB, 'exercises'>>[] = [];
      if (userId) {
        conditions.push(eb('user_id', '=', userId));
      }
      if (trainingId) {
        conditions.push(eb('training_id', '=', trainingId));
      }
      return eb.and(conditions);
    });

    return await query.execute();
  }

  async create(data: {
    name: string;
    userId: number;
    trainingId: number;
    type: ExerciseType;
    description?: string;
    exampleUrl?: string;
  }) {
    return await this.kyselyService.db
      .insertInto('exercises')
      .values({
        type: data.type,
        name: data.name,
        user_id: data.userId,
        training_id: data.trainingId,
        description: data.description,
        example_url: data.exampleUrl,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: number) {
    const result = await this.kyselyService.db
      .deleteFrom('exercises')
      .where('id', '=', id)
      .executeTakeFirst();
    return result.numDeletedRows > 0;
  }

  async updatePartly(data: {
    id: number;
    name?: string;
    type?: ExerciseType;
    userId?: number;
    trainingId?: number;
    exampleUrl?: string;
    description?: string;
  }) {
    return await this.kyselyService.db
      .updateTable('exercises')
      .where('id', '=', data.id)
      .set({
        type: data.type,
        name: data.name,
        user_id: data.userId,
        description: data.description,
        training_id: data.trainingId,
        example_url: data.exampleUrl,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async updateAndReplace(
    id: number,
    data: {
      name: string;
      type: ExerciseType;
      trainingId: number;
    } & Nullable<{
      exampleUrl?: string;
      description?: string;
    }>,
  ) {
    return await this.kyselyService.db
      .updateTable('exercises')
      .where('id', '=', id)
      .set({
        type: data.type,
        name: data.name,
        description: data.description,
        training_id: data.trainingId,
        example_url: data.exampleUrl,
      })
      .returningAll()
      .executeTakeFirst();
  }
}
