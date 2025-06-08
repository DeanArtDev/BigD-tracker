import { RepetitionRawData } from '@/repetitions/repetitions.mapper';
import { Injectable } from '@nestjs/common';
import { BulkInsertFailedError } from '@shared/lib/errors';
import { Override } from '@shared/lib/type-helpers';
import { KyselyService } from '@shared/modules/db';

@Injectable()
export class RepetitionsRepository {
  constructor(private readonly kyselyService: KyselyService) {}

  async createMany(
    data: RepetitionRawData['insertable'][],
  ): Promise<RepetitionRawData['selectable'][]> {
    try {
      return await this.kyselyService.db.transaction().execute(async (transaction) => {
        return await transaction.insertInto('repetitions').values(data).returningAll().execute();
      });
    } catch (e) {
      throw new BulkInsertFailedError(e?.message ?? 'Bulk insert of repetitions is failed');
    }
  }

  async update(
    data: Override<RepetitionRawData['updateable'], 'id', number>,
  ): Promise<RepetitionRawData['selectable'] | undefined> {
    return await this.kyselyService.db
      .updateTable('repetitions')
      .set(data)
      .returningAll()
      .executeTakeFirst();
  }

  async findByExerciseId(id: number): Promise<RepetitionRawData['selectable'] | undefined> {
    return this.kyselyService.db
      .selectFrom('repetitions')
      .where('exercises_id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }

  async findTemplatables(): Promise<RepetitionRawData['selectable'][]> {
    return this.kyselyService.db
      .selectFrom('repetitions')
      .where('user_id', 'is', null)
      .selectAll()
      .execute();
  }

  async deleteMany(ids: number[]): Promise<boolean> {
    if (ids.length === 0) return false;
    try {
      await this.kyselyService.db.transaction().execute(async (transaction) => {
        return await transaction.deleteFrom('repetitions').where('id', 'in', ids).execute();
      });
      return true;
    } catch (e) {
      throw new BulkInsertFailedError(e?.message ?? 'Bulk delete of repetitions is failed');
    }
  }
}
