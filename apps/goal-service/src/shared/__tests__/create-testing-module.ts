import { AppModule } from '@/app.module';
import { DB } from '@/infrastructure/types';
import { databaseToken, IKyselyPostgresDB } from '@big-d/database';
import { Test } from '@nestjs/testing';
import { Kysely, Transaction } from 'kysely';

function createTestingModule() {
  return Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(databaseToken.CONNECTION)
    .useValue({
      runTransaction: <T>(work: (trx: Transaction<DB>) => Promise<T>) =>
        work({} as Transaction<DB>),
      qb: () => ({}) as Kysely<DB>,
    } satisfies IKyselyPostgresDB<DB>);
}

export { createTestingModule };
