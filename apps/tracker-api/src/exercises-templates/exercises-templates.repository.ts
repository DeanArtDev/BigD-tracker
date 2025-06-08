import { Injectable } from '@nestjs/common';
import { OmitCreateFields, Override } from '@shared/lib/type-helpers';
import { DB, KyselyService } from '@shared/modules/db';
import { ExpressionBuilder } from 'kysely';
import { ExerciseTemplateRawData } from './exercise-template.mapper';
import { ExerciseType } from './entity/exercise-template.entity';

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

  async findByIds(ids: number[]): Promise<ExerciseTemplateRawData['selectable'][] | undefined> {
    return await this.kyselyService.db
      .selectFrom('exercises_templates')
      .where('id', '=', ids)
      .selectAll()
      .execute();
  }

  async findByFilters(
    userId: number,
    filters: {
      my: boolean;
    },
  ): Promise<ExerciseTemplateRawData['selectable'][]> {
    let query = this.kyselyService.db
      .selectFrom('exercises_templates')
      .orderBy('created_at', 'desc')
      .selectAll();

    query = query.where((eb) => {
      const conditions: ReturnType<ExpressionBuilder<DB, 'exercises_templates'>>[] = [];

      conditions.push(eb('user_id', '=', userId));
      if (!filters.my) {
        conditions.push(eb('user_id', 'is', null));
      }
      return eb.or(conditions);
    });

    return await query.execute();
  }

  async create(
    data: OmitCreateFields<ExerciseTemplateRawData['insertable']>,
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
    data: Override<ExerciseTemplateRawData['updateable'], 'id', number>[],
    options: { replace: boolean } = { replace: false },
  ): Promise<ExerciseTemplateRawData['selectable'][]> {
    const { replace } = options;

    return await this.kyselyService.db.transaction().execute(async (transaction) => {
      const buffer: ExerciseTemplateRawData['selectable'][] = [];

      for (const item of data) {
        const result = await transaction
          .updateTable('exercises_templates')
          .where('id', '=', item.id)
          .set({
            type: item.type,
            name: item.name,
            description: item.description ?? (replace ? null : undefined),
            example_url: item.example_url ?? (replace ? null : undefined),
            updated_at: new Date(),
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        buffer.push(result);
      }

      return buffer;
    });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.kyselyService.db
      .deleteFrom('exercises_templates')
      .where('id', '=', id)
      .executeTakeFirst();
    return result.numDeletedRows > 0;
  }
}
