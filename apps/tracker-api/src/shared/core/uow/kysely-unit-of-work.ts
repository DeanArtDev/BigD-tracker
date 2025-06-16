import { DB, KyselyService } from '@/infrastructure/db';
import { Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

@Injectable()
export class KyselyUnitOfWork {
  private transaction: Transaction<DB> | null = null;

  constructor(private readonly kyselyService: KyselyService) {}

  public useTransaction(trx?: Transaction<DB>): this {
    this.transaction = trx ?? null;
    return this;
  }

  async execute<T>(
    work: (trx: Transaction<DB>) => Promise<T>,
    transaction?: Transaction<DB>,
  ): Promise<T> {
    if (transaction != null) {
      return await work(transaction);
    } else {
      return this.kyselyService.db.transaction().execute(async (trx) => await work(trx));
    }
  }
}
