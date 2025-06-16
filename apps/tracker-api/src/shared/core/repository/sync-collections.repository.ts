import { Generated } from '@/infrastructure/db/types';
import { Injectable } from '@nestjs/common';
import { Kysely, Transaction } from 'kysely';
import { CollectionDelta, CollectionDeltaCalculator, IdType } from './collection-delta-calculator';

type OnlyTablesWithId<T> = {
  [P in keyof T as T[P] extends { id: Generated<number> } ? P : never]: T[P];
};

type SyncCollectionParam<DB, TId extends IdType = number> = {
  trx: Transaction<DB>;
  tableName: keyof OnlyTablesWithId<DB>;
  parent: { field: string; id: TId };
  newRowsIds: TId[];
};

interface ISyncCollectionMethods<TAggregate, DB> {
  upsertRoot: (aggregate: TAggregate, trx: Transaction<DB>) => Promise<void>;
  sync: (aggregate: TAggregate, trx: Transaction<DB>) => Promise<void>;
}

class SyncCollectionRepositoryHelper<TAggregate, DB> {
  constructor(
    private readonly data: {
      readonly upsertRoot: ISyncCollectionMethods<TAggregate, DB>['upsertRoot'];
      readonly sync: ISyncCollectionMethods<TAggregate, DB>['sync'];
      readonly db: Kysely<DB>;
    },
  ) {}

  async save(aggregate: TAggregate, trx?: Transaction<DB>): Promise<void> {
    if (trx != null) {
      await this.data.upsertRoot(aggregate, trx);
      await this.data.sync(aggregate, trx);
      return;
    }

    return await this.data.db.transaction().execute(async (t) => {
      await this.data.upsertRoot(aggregate, t);
      await this.data.sync(aggregate, t);
    });
  }
}

@Injectable()
class SyncCollectionRepository<DB, TId extends IdType = number> {
  constructor() {}

  async execute(data: SyncCollectionParam<DB, TId>): Promise<CollectionDelta<TId>> {
    const { parent, trx, tableName, newRowsIds } = data;

    const rows = await trx
      .selectFrom(tableName)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      .select(['id'])
      .where(parent.field, '=', parent.id)
      .execute();

    const oldIds = rows.map((r) => r.id);
    const delta = CollectionDeltaCalculator.calculate({
      previousIds: oldIds,
      currentIds: newRowsIds,
    });

    if (delta.toDelete.length > 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      await trx.deleteFrom(tableName).where('id', 'in', delta.toDelete).execute();
    }

    return delta;
  }
}

export {
  SyncCollectionRepository,
  SyncCollectionParam,
  ISyncCollectionMethods,
  SyncCollectionRepositoryHelper,
};
