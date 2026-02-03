import { sql } from 'kysely';
import type { Expression, SqlBool } from 'kysely';

type LikeMode = 'contains' | 'startsWith' | 'endsWith' | 'exact';

type PgLikeOptions = {
  trim?: boolean;
  emptyAsTrue?: boolean; // если поиск пустой — вернуть TRUE (фильтр "не применился")
  mode?: LikeMode;
  caseInsensitive?: boolean; // ILIKE vs LIKE
  escapeChar?: '\\'; // оставим '\' чтобы не плодить варианты
};

/**
 * Экранирует спецсимволы LIKE-паттерна: %, _, и сам escapeChar.
 * Для Postgres дефолтный escape внутри LIKE/ILIKE — backslash.
 */
function pgEscapeLike(input: string, escapeChar: '\\' = '\\'): string {
  // сначала экранируем сам '\', потом % и _
  return input
    .replaceAll(escapeChar, escapeChar + escapeChar)
    .replaceAll('%', escapeChar + '%')
    .replaceAll('_', escapeChar + '_');
}

function addWildcards(escaped: string, mode: LikeMode): string {
  switch (mode) {
    case 'contains':
      return `%${escaped}%`;
    case 'startsWith':
      return `${escaped}%`;
    case 'endsWith':
      return `%${escaped}`;
    case 'exact':
      return escaped;
  }
}

/**
 * Типобезопасный LIKE/ILIKE:
 *  - DB задаётся дженериком
 *  - table и column типизируются как keyof DB и keyof DB[table]
 *  - колонка подставляется через sql.ref("<table>.<column>")
 */
function pgLikeExpr<DB, TTable extends keyof DB, TColumn extends keyof DB[TTable] & string>(
  params: {
    table: TTable;
    column: TColumn;
    value: string;
  } & PgLikeOptions,
): Expression<SqlBool> {
  const {
    table,
    column,
    value: raw,
    trim = true,
    emptyAsTrue = true,
    mode = 'contains',
    caseInsensitive = true,
    escapeChar = '\\',
  } = params;

  const v = trim ? raw.trim() : raw;

  if (v.length === 0) {
    return emptyAsTrue ? sql<SqlBool>`true` : sql<SqlBool>`false`;
  }

  const escaped = pgEscapeLike(v, escapeChar);
  const pattern = addWildcards(escaped, mode);

  // ref/raw — по докам Kysely, но raw/ref должны быть только из доверенных строк (у нас — из типизированных table/column). :contentReference[oaicite:3]{index=3}
  const colRef = `${String(table)}.${String(column)}`;
  const op = caseInsensitive ? sql.raw('ilike') : sql.raw('like');

  // pattern подставляется как параметр (без SQL-инъекций), ref/op — статические.
  return sql<SqlBool>`${sql.ref(colRef)} ${op} ${pattern}`;
}

export { pgLikeExpr };
