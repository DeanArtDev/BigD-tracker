import { TrainingRawData } from '@/tranings/trainings.mapper';
import { Injectable } from '@nestjs/common';
import { Override } from '@shared/lib/type-helpers';
import { KyselyService } from '@shared/modules/db';

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

  async update(
    data: Override<TrainingRawData['updateable'], 'id', number>,
    options: { replace: boolean } = { replace: false },
  ): Promise<TrainingRawData['selectable'] | undefined> {
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
