import { IKyselyPostgresDB } from '@big-d/database';
import { createKyselyQueryRecorderDb, RecordedKyselyQuery } from './kysely-query-recorder';

type ExpectedKyselyQuery = {
  readonly sql: string;
  readonly parameters: readonly unknown[];
};

function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
}

function expectSqlQuery(query: RecordedKyselyQuery, expected: ExpectedKyselyQuery) {
  expect(normalizeSql(query.sql)).toBe(normalizeSql(expected.sql));
  expect(query.parameters).toEqual(expected.parameters);
}

async function withRepository<DB extends Record<string, unknown>, TRepository>(
  createRepository: (db: IKyselyPostgresDB<DB>) => TRepository,
  work: (ctx: {
    repository: TRepository;
    recorder: ReturnType<typeof createKyselyQueryRecorderDb<DB>>;
  }) => Promise<void>,
) {
  const recorder = createKyselyQueryRecorderDb<DB>();
  const repository = createRepository(recorder.db);

  try {
    await work({ repository, recorder });
  } finally {
    await recorder.destroy();
  }
}

export { normalizeSql, expectSqlQuery, withRepository };
