import { describe, expect, it } from 'vitest';
import { projectPostgresqlError } from './postgresql-error-projection';

describe('projectPostgresqlError', () => {
  it('projects PostgreSQL diagnostics without SQL or query parameters', () => {
    const cause = new Error('socket closed');
    const error = Object.assign(new Error('duplicate key value violates unique constraint'), {
      name: 'DatabaseError',
      code: '23505',
      severity: 'ERROR',
      detail: 'Key (r_id, r_start)=(42, 2026-08-12) already exists.',
      hint: 'Use another recurrence start',
      position: '184',
      internalPosition: '12',
      where: 'SQL statement in function upsert_override',
      schema: 'public',
      table: 'tasks_recurrences_overrides',
      column: 'r_start',
      dataType: 'timestamp without time zone',
      constraint: 'tasks_recurrences_override_r_id_r_start_unique',
      file: 'nbtinsert.c',
      line: '664',
      routine: '_bt_check_unique',
      query: 'insert into tasks_recurrences_overrides values ($1, $2)',
      parameters: [42, '2026-08-12'],
      cause,
    });

    expect(projectPostgresqlError(error)).toEqual({
      type: 'DatabaseError',
      message: 'duplicate key value violates unique constraint',
      stack: expect.any(String),
      code: '23505',
      retryable: false,
      severity: 'ERROR',
      detail: 'Key (r_id, r_start)=(42, 2026-08-12) already exists.',
      hint: 'Use another recurrence start',
      position: '184',
      internalPosition: '12',
      where: 'SQL statement in function upsert_override',
      schema: 'public',
      table: 'tasks_recurrences_overrides',
      column: 'r_start',
      dataType: 'timestamp without time zone',
      constraint: 'tasks_recurrences_override_r_id_r_start_unique',
      file: 'nbtinsert.c',
      line: '664',
      routine: '_bt_check_unique',
      cause,
    });
  });

  it.each(['08006', '40001', '40P01', '55P03', '57P03'])('marks PostgreSQL code %s as retryable', (code) => {
    expect(projectPostgresqlError(Object.assign(new Error('database failure'), { code }))).toMatchObject({
      code,
      retryable: true,
    });
  });

  it('keeps retryable connection diagnostics in details', () => {
    expect(
      projectPostgresqlError(
        Object.assign(new Error('connect ECONNREFUSED'), {
          code: 'ECONNREFUSED',
          errno: -61,
          syscall: 'connect',
          address: '127.0.0.1',
          port: 5432,
        }),
      ),
    ).toMatchObject({
      code: 'ECONNREFUSED',
      retryable: true,
      details: {
        errno: -61,
        syscall: 'connect',
        address: '127.0.0.1',
        port: 5432,
      },
    });
  });
});
