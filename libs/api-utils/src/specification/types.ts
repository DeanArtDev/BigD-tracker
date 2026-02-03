import { Expression, ExpressionBuilder, ExpressionWrapper, SqlBool } from 'kysely';

/**
 * Тип комбинатора
 * */
type SpecKind = 'leaf' | 'and' | 'or' | 'not';

/**
 * Назначение спецификации
 */
type SpecPurpose = 'security' | 'policy' | 'filter' | 'search' | 'performance';

type SpecMeta = Readonly<Record<string, unknown>>;

type TDB = Record<string, any>;

interface SpecificationObject<TTable extends TDB, TKind extends SpecKind = SpecKind> {
  readonly tableName: keyof TTable;
  readonly key: string;
  readonly kind: TKind;
  readonly purpose?: SpecPurpose;
  readonly meta?: SpecMeta;

  /**
   * Дерево для debug/observability
   */
  readonly children?: ReadonlyArray<SpecificationObject<TTable>>;

  /**
   * Сама трансляция в Expression Kysely
   */
  toExpr(
    eb: ExpressionBuilder<TTable, keyof TTable>,
  ): ExpressionWrapper<TTable, keyof TTable, SqlBool> | Expression<SqlBool>;
}

type LeafSpecParams<TTable extends TDB> = {
  tableName: keyof TTable;
  key: string;
  purpose?: SpecPurpose;
  meta?: SpecMeta;
  toExpr: SpecificationObject<TTable>['toExpr'];
};

export { SpecKind, SpecPurpose, SpecMeta, TDB, SpecificationObject, LeafSpecParams };
