import { Injectable } from '@nestjs/common';
import { Override } from '@shared/lib/type-helpers';
import { DB, KyselyService } from '@shared/modules/db';
import { ExpressionBuilder, Nullable } from 'kysely';
import { ExerciseTemplateRawData } from './exercise-template.mapper';
import { ExerciseType } from './entity/exercise.entity';

@Injectable()
export class ExercisesTemplatesRepository {
  constructor(private readonly kyselyService: KyselyService) {}

  async findOneById({
    id,
  }: {
    id: number;
  }): Promise<ExerciseTemplateRawData['selectable'] | undefined> {
    return await this.kyselyService.db
      .selectFrom('exercises_templates')
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
      .selectFrom('exercises_templates')
      .orderBy('created_at', 'desc')
      .selectAll();

    const { userId } = filters;
    query = query.where((eb) => {
      const conditions: ReturnType<ExpressionBuilder<DB, 'exercises_templates'>>[] = [];
      if (userId) {
        conditions.push(eb('user_id', '=', userId));
      }
      return eb.and(conditions);
    });

    return await query.execute();
  }

  async create(
    data: ExerciseTemplateRawData['insertable'],
  ): Promise<ExerciseTemplateRawData['selectable'] | undefined> {
    return await this.kyselyService.db
      .insertInto('exercises_templates')
      .values({
        type: data.type,
        name: data.name,
        user_id: data.user_id,
        description: data.description,
        example_url: data.example_url,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async updatePartly(
    id: number,
    data: {
      name?: string;
      type?: ExerciseType;
      exampleUrl?: string;
      description?: string;
    },
  ) {
    return await this.kyselyService.db
      .updateTable('exercises_templates')
      .where('id', '=', id)
      .set({
        type: data.type,
        name: data.name,
        description: data.description,
        example_url: data.exampleUrl,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async update(
    data: Override<ExerciseTemplateRawData['insertable'], 'id', number>,
    options: { replace: boolean } = { replace: false },
  ): Promise<ExerciseTemplateRawData['selectable'] | undefined> {
    const { replace } = options;

    return await this.kyselyService.db
      .updateTable('exercises_templates')
      .where('id', '=', data.id)
      .set({
        type: data.type,
        name: data.name,
        description: data.description ?? (replace ? null : undefined),
        example_url: data.example_url ?? (replace ? null : undefined),
      })
      .returningAll()
      .executeTakeFirst();
  }

  async updateAndReplace(
    id: number,
    data: {
      name: string;
      type: ExerciseType;
    } & Nullable<{
      exampleUrl: string;
      description: string;
    }>,
  ) {
    return await this.kyselyService.db
      .updateTable('exercises_templates')
      .where('id', '=', id)
      .set({
        type: data.type,
        name: data.name,
        description: data.description,
        example_url: data.exampleUrl,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: number) {
    const result = await this.kyselyService.db
      .deleteFrom('exercises_templates')
      .where('id', '=', id)
      .executeTakeFirst();
    return result.numDeletedRows > 0;
  }
}
