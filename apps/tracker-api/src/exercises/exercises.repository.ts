import { Injectable } from '@nestjs/common';
import { Override } from '@shared/lib/type-helpers';
import { KyselyService } from '@shared/modules/db';
import { ExerciseRawData } from './exercise.mapper';

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

  async create(
    data: ExerciseRawData['insertable'],
  ): Promise<ExerciseRawData['selectable'] | undefined> {
    return await this.kyselyService.db
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
  }

  async delete(id: number) {
    const result = await this.kyselyService.db
      .deleteFrom('exercises')
      .where('id', '=', id)
      .executeTakeFirst();
    return result.numDeletedRows > 0;
  }

  async update(
    data: Override<ExerciseRawData['updateable'], 'id', number>,
    options: { replace: boolean } = { replace: false },
  ) {
    const { replace } = options;

    return await this.kyselyService.db
      .updateTable('exercises')
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
}
