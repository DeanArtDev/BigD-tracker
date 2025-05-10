import { Injectable, OnApplicationShutdown, Inject } from '@nestjs/common';
import {
  KYSELY_DATABASE_PROVIDER,
  KyselyDatabaseProvider,
} from './database.kysely.provider';

@Injectable()
export class KyselyService implements OnApplicationShutdown {
  constructor(
    @Inject(KYSELY_DATABASE_PROVIDER)
    private readonly kyselyInstance: KyselyDatabaseProvider,
  ) {}

  get db(): KyselyDatabaseProvider['db'] {
    return this.kyselyInstance.db;
  }

  async onApplicationShutdown(signal: string) {
    console.log(`Shutting down DB pool due to ${signal}`);

    await this.kyselyInstance.pool.end();
  }
}
