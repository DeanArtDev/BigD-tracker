import { OnModuleDestroy } from '@nestjs/common';
import { Kysely } from 'kysely';

export abstract class Database<TDatabase> extends Kysely<TDatabase> implements OnModuleDestroy {
  public abstract onModuleDestroy(): Promise<void>;
}
