import { BaseRepository } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION, DB } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { ThingRawData, ThingsRepository } from '../application';
import { ThingEntity } from '../domain/thing.entity';

@Injectable()
export class KyselyThingsRepository extends BaseRepository<DB> implements ThingsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly database: Database<DB>) {
    super(database);
  }

  #map = (raw: ThingRawData['selectable']): ThingEntity => {
    return ThingEntity.restore({
      id: raw.id,
    });
  };
}
