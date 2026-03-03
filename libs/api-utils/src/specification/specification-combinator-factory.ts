import { andFor, leafSpec, notFor, orFor } from './combinators';
import { LeafSpecParams, TDB } from './types';

function specificationCombinatorFactory<TTable extends TDB>(tableName: keyof TTable) {
  return {
    and: andFor(tableName),
    or: orFor(tableName),
    not: notFor(tableName),
    leaf: (params: Omit<LeafSpecParams<TTable>, 'tableName'>) => leafSpec<TTable>({ tableName, ...params }),
  };
}

export { specificationCombinatorFactory };
