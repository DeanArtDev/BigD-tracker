import { DB, KyselyService } from '@/infrastructure/db';
import { Injectable, Scope } from '@nestjs/common';
import { Transaction } from 'kysely';

@Injectable({ scope: Scope.REQUEST })
export class KyselyUnitOfWork {
  private transaction: Transaction<DB> | null = null;

  constructor(private readonly kyselyService: KyselyService) {}

  public useTransaction(trx?: Transaction<DB>): this {
    if (this.transaction == null && trx != null) {
      this.transaction = trx;
    }
    return this;
  }

  async execute<T>(work: (trx: Transaction<DB>) => Promise<T>): Promise<T> {
    if (this.transaction != null) {
      return await work(this.transaction);
    } else {
      return this.kyselyService.db.transaction().execute(async (trx) => await work(trx));
    }
  }
}
