import { OnApplicationShutdown } from '@nestjs/common';
import { Kysely } from 'kysely';

export abstract class Database<TDatabase>
  extends Kysely<TDatabase>
  implements OnApplicationShutdown
{
  public abstract onApplicationShutdown(): Promise<void>;
}
