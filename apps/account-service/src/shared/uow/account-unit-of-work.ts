import { KyselyUnitOfWork } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION, DB } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
class AccountUnitOfWork extends KyselyUnitOfWork<DB> {
  constructor(@Inject(DATABASE_CONNECTION) private readonly database: Database<DB>) {
    super(database);
  }
}

export { AccountUnitOfWork };
