import { DB } from '@/infrastructure/types';
import { Database } from '@/modules/tasks/application/ports';
import {
  CompiledQuery,
  DatabaseConnection,
  Dialect,
  Driver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  Transaction,
} from 'kysely';

type QueryResult = {
  rows: Array<Record<string, unknown>>;
  numAffectedRows?: bigint;
  numChangedRows?: bigint;
  insertId?: bigint;
};

class SqlCaptureConnection implements DatabaseConnection {
  constructor(
    private readonly queries: CompiledQuery[],
    private readonly results: QueryResult[],
  ) {}

  async executeQuery<R>(compiledQuery: CompiledQuery): Promise<{ rows: R[] }> {
    this.queries.push(compiledQuery);
    return (this.results.shift() ?? { rows: [] }) as { rows: R[] };
  }

  async *streamQuery(): AsyncIterableIterator<{ rows: unknown[] }> {
    throw new Error('streamQuery is not supported in SQL capture tests');
  }
}

class SqlCaptureDriver implements Driver {
  constructor(
    private readonly queries: CompiledQuery[],
    private readonly results: QueryResult[],
  ) {}

  async init(): Promise<void> {}

  async acquireConnection(): Promise<DatabaseConnection> {
    return new SqlCaptureConnection(this.queries, this.results);
  }

  async beginTransaction(): Promise<void> {}

  async commitTransaction(): Promise<void> {}

  async rollbackTransaction(): Promise<void> {}

  async releaseConnection(): Promise<void> {}

  async destroy(): Promise<void> {}
}

class SqlCaptureDialect implements Dialect {
  constructor(
    private readonly queries: CompiledQuery[],
    private readonly results: QueryResult[],
  ) {}

  createAdapter() {
    return new PostgresAdapter();
  }

  createDriver() {
    return new SqlCaptureDriver(this.queries, this.results);
  }

  createQueryCompiler() {
    return new PostgresQueryCompiler();
  }

  createIntrospector(db: Kysely<unknown>) {
    return new PostgresIntrospector(db);
  }
}

const createSqlCaptureDb = (results: QueryResult[] = []) => {
  const queries: CompiledQuery[] = [];
  const kysely = new Kysely<DB>({
    dialect: new SqlCaptureDialect(queries, results),
  });
  const db = {
    qb: (trx?: Transaction<DB>) => trx ?? kysely,
  } as Database<DB>;

  return { db, queries };
};

const serializeQueries = (queries: CompiledQuery[]) =>
  queries.map(({ sql, parameters }) => ({ sql, parameters }));

export { QueryResult, createSqlCaptureDb, serializeQueries };
