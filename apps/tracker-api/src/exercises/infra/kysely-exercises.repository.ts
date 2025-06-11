import { Injectable } from '@nestjs/common';
import { DB, KyselyService } from '@shared/modules/db';
import { ExpressionBuilder } from 'kysely';
import {
  ExerciseRawData,
  ExercisesRepository,
  ExerciseType,
} from '../application/exercises.repository';
import { ExerciseEntity } from '../domain/exercise.entity';

@Injectable()
export class KyselyExercisesRepository implements ExercisesRepository {
  constructor(private readonly kyselyService: KyselyService) {}

  async findOneById(id: number): Promise<ExerciseEntity | null> {
    const result = await this.kyselyService.db
      .selectFrom('exercises')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (result == null) return null;

    return this.#map(result);
  }

  async findAllByIds(ids: number[]): Promise<ExerciseEntity[]> {
    const result = await this.kyselyService.db
      .selectFrom('exercises')
      .where('id', 'in', ids)
      .selectAll()
      .execute();
    return result.map(this.#map);
  }

  async findAllByFilters(filters: { userId: number; my?: boolean }): Promise<ExerciseEntity[]> {
    let query = this.kyselyService.db
      .selectFrom('exercises')
      .orderBy('created_at', 'desc')
      .selectAll();

    query = query.where((eb) => {
      const conditions: ReturnType<ExpressionBuilder<DB, 'exercises'>>[] = [];

      conditions.push(eb('user_id', '=', filters.userId));
      if (!filters.my) {
        conditions.push(eb('user_id', 'is', null));
      }
      return eb.or(conditions);
    });

    const result = await query.execute();
    return result.map(this.#map);
  }

  async create(data: ExerciseRawData['insertable']): Promise<ExerciseEntity | null> {
    const result = await this.kyselyService.db
      .insertInto('exercises')
      .values({
        type: data.type,
        name: data.name,
        user_id: data.user_id,
        description: data.description,
        example_url: data.example_url,
      })
      .returningAll()
      .executeTakeFirst();

    if (result == null) return null;

    return this.#map(result);
  }

  async update(
    data: ExerciseRawData['updateable'],
    options: { replace: boolean } = { replace: false },
  ): Promise<ExerciseEntity | null> {
    const { replace } = options;

    const result = await this.kyselyService.db
      .updateTable('exercises')
      .where('id', '=', data.id)
      .set({
        type: data.type,
        name: data.name,
        description: data.description ?? (replace ? null : undefined),
        example_url: data.example_url ?? (replace ? null : undefined),
        updated_at: new Date(),
      })
      .returningAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.kyselyService.db
      .deleteFrom('exercises')
      .where('id', '=', id)
      .executeTakeFirst();

    return result.numDeletedRows > 0;
  }

  #map = (raw: ExerciseRawData['selectable']): ExerciseEntity => {
    return ExerciseEntity.restore({
      id: raw.id,
      userId: raw.user_id ?? undefined,
      name: raw.name,
      type: raw.type as ExerciseType,
      description: raw.description ?? undefined,
      exampleUrl: raw.example_url ?? undefined,
      trainingId: raw.training_id ?? undefined,
      trainingTemplateId: raw.training_template_id ?? undefined,
    });
  };
}
