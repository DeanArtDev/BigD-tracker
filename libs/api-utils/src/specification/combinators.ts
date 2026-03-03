import { LeafSpecParams, SpecificationObject, SpecMeta, SpecPurpose, TDB } from './types';

function leafSpec<TTable extends TDB>(params: LeafSpecParams<TTable>): SpecificationObject<TTable, 'leaf'> {
  return {
    tableName: params.tableName,
    key: params.key,
    kind: 'leaf',
    purpose: params.purpose,
    meta: params.meta,
    toExpr: params.toExpr,
  };
}

/**
 * Runtime-check на mismatch таблицы
 */
function assertSameTable<TTable extends TDB>(
  table: keyof TTable,
  specs: ReadonlyArray<SpecificationObject<TTable>>,
): void {
  for (const s of specs) {
    if (s.tableName !== table) {
      throw new Error(
        `Spec table mismatch: expected "${String(table)}" but got "${String(s.tableName)}" in spec "${s.key}"`,
      );
    }
  }
}

const andFor =
  <TTable extends TDB>(table: keyof TTable) =>
  (...specs: Array<SpecificationObject<TTable>>): SpecificationObject<TTable, 'and'> => {
    assertSameTable<TTable>(table, specs);

    return {
      tableName: table,
      key: `${String(table)}.and`,
      kind: 'and',
      purpose: 'filter',
      children: specs,
      toExpr: (eb) => eb.and(specs.map((s) => s.toExpr(eb))),
    };
  };

const orFor =
  <TTable extends TDB>(table: keyof TTable) =>
  (...specs: Array<SpecificationObject<TTable>>): SpecificationObject<TTable, 'or'> => {
    assertSameTable(table, specs);

    return {
      tableName: table,
      key: `${String(table)}.or`,
      kind: 'or',
      purpose: 'filter',
      children: specs,
      toExpr: (eb) => eb.or(specs.map((s) => s.toExpr(eb))),
    };
  };

const notFor =
  <TTable extends TDB>(table: keyof TTable) =>
  (spec: SpecificationObject<TTable>): SpecificationObject<TTable, 'not'> => {
    assertSameTable(table, [spec]);

    return {
      tableName: table,
      key: `${String(table)}.not`,
      kind: 'not',
      purpose: 'filter',
      children: [spec],
      toExpr: (eb) => eb.not(spec.toExpr(eb)),
    };
  };

/**
 * Переопредление описания спецификации
 */
function tagSpec<TTable extends TDB>(
  spec: SpecificationObject<TTable>,
  params: { key: string; purpose?: SpecPurpose; meta?: SpecMeta },
): SpecificationObject<TTable> {
  return {
    ...spec,
    key: params.key,
    purpose: params.purpose ?? spec.purpose,
    meta: params.meta ?? spec.meta,
  };
}

export { tagSpec, andFor, orFor, notFor, leafSpec };
