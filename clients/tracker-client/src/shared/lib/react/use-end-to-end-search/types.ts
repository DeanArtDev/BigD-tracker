import type { Dispatch, SetStateAction } from 'react';

export type SearchValues = string | null | undefined;
export type DefaultDataType = Record<string, any>;

export interface EndToEndSearchParams<T extends DefaultDataType = DefaultDataType> {
  readonly data: T[];
  readonly predicates: {
    [K in keyof T]?: (value: T[K], search: SearchValues) => boolean;
  } & { entity?: (value: T, search: SearchValues) => boolean };
}

export interface EndToEndSearchData<T extends DefaultDataType> {
  readonly foundData: T[];
  readonly isPending: boolean;
  readonly searchValue: SearchValues;
  readonly handleSearchChange: Dispatch<SetStateAction<SearchValues>>;
}
