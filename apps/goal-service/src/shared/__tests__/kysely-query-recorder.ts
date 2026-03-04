import { IKyselyPostgresDB } from '@big-d/database';
import {
  CompiledQuery,
  DatabaseConnection,
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  Transaction,
} from 'kysely';

type RecordedKyselyQuery = {
  readonly sql: string;
  readonly parameters: readonly unknown[];
};

type RecordedKyselyQueryResult = {
  readonly rows?: ReadonlyArray<unknown>;
  readonly numAffectedRows?: bigint;
  readonly numChangedRows?: bigint;
  readonly insertId?: bigint;
};

function createKyselyQueryRecorderDb<DB extends Record<string, unknown>>() {
  const queries: RecordedKyselyQuery[] = [];
  const resultQueue: RecordedKyselyQueryResult[] = [];

  class RecordingConnection implements DatabaseConnection {
    // eslint-disable-next-line @typescript-eslint/require-await
    async executeQuery<R>(compiledQuery: CompiledQuery) {
      queries.push({
        sql: compiledQuery.sql,
        parameters: [...compiledQuery.parameters],
      });

      const nextResult = resultQueue.shift();

      return {
        rows: (nextResult?.rows ?? []) as R[],
        numAffectedRows: nextResult?.numAffectedRows,
        numChangedRows: nextResult?.numChangedRows,
        insertId: nextResult?.insertId,
      };
    }

    async *streamQuery<R>(compiledQuery: CompiledQuery) {
      yield await this.executeQuery<R>(compiledQuery);
    }
  }

  class RecordingDriver extends DummyDriver {
    // eslint-disable-next-line @typescript-eslint/require-await
    override async acquireConnection(): Promise<DatabaseConnection> {
      return new RecordingConnection();
    }
  }

  const queryBuilder = new Kysely<DB>({
    dialect: {
      createAdapter: () => new PostgresAdapter(),
      createDriver: () => new RecordingDriver(),
      createIntrospector: (db) => new PostgresIntrospector(db),
      createQueryCompiler: () => new PostgresQueryCompiler(),
    },
  });

  const db: IKyselyPostgresDB<DB> = {
    qb: (trx?: Transaction<DB>) => trx ?? queryBuilder,
    runTransaction: async <T>(work: (trx: Transaction<DB>) => Promise<T>) =>
      await queryBuilder.transaction().execute(work),
  };

  return {
    db,
    queries,
    enqueueResult(result: RecordedKyselyQueryResult) {
      resultQueue.push(result);
    },
    clearQueries() {
      queries.length = 0;
      resultQueue.length = 0;
    },
    destroy: async () => await queryBuilder.destroy(),
  };
}

export { createKyselyQueryRecorderDb, RecordedKyselyQuery, RecordedKyselyQueryResult };
