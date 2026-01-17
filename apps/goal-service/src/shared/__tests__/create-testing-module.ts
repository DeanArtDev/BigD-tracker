import { AppModule } from '@/app.module';
import { DB } from '@/infrastructure/types';
import { databaseToken, IKyselyPostgresDB } from '@big-d/database';
import { Test } from '@nestjs/testing';
import { Kysely, Transaction } from 'kysely';

const TEST_TRANSACTION_ID = 333;

class TestTransaction {
  public trueTransaction = true;
  constructor(public readonly id: number) {}
}

const trxWithId =
  (id: number) =>
  <T>(work: (trx: Transaction<DB>) => Promise<T>) =>
    work(new TestTransaction(id) as unknown as Transaction<DB>);

const databaseMockImplementation = {
  runTransaction: trxWithId(TEST_TRANSACTION_ID),
  qb: () => ({}) as Kysely<DB>,
} satisfies IKyselyPostgresDB<DB>;

function createTestingModule() {
  return Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(databaseToken.CONNECTION)
    .useValue(databaseMockImplementation);
}

export { createTestingModule, TestTransaction, TEST_TRANSACTION_ID };
