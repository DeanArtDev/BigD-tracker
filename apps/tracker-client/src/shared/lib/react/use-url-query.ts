import { isEmpty } from 'lodash-es';
import qs from 'qs';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { type SetURLSearchParams, useLocation, useSearchParams } from 'react-router-dom';
import { ZodType } from 'zod';

interface UrlQueryMap {
  [key: string]:
    | undefined
    | string
    | number
    | number[]
    | boolean
    | boolean[]
    | string[]
    | UrlQueryMap
    | UrlQueryMap[];
}

type UseUrlQueryResponse<TSchema extends UrlQueryMap> = readonly [
  TSchema | undefined,
  (value: TSchema) => void,
];

function useUrlQuery<TSchema extends UrlQueryMap = UrlQueryMap>(
  schema: ZodType,
  defaultInit?: TSchema,
): UseUrlQueryResponse<TSchema> {
  const { 1: setSearchParams } = useSearchParams();

  const currentQuery = useLocation().search;

  const setSearchQuery = useCallback<UseUrlQueryResponse<TSchema>[1]>(
    (value) => {
      const parsedCurrentQuery = qs.parse(currentQuery, { ignoreQueryPrefix: true });
      setSearchParams(qs.stringify({ ...parsedCurrentQuery, ...value }, { addQueryPrefix: true }));
    },
    [currentQuery, setSearchParams],
  );

  const searchQuery = useMemo(() => {
    const parsed = schema.safeParse(
      qs.parse(currentQuery, { ignoreQueryPrefix: true, interpretNumericEntities: true }),
    );
    return parsed.success && !isEmpty(parsed.data) ? parsed.data : undefined;
  }, [currentQuery, schema]);

  const searchQueryWithDefaultUntilFirstSet = useDefaultResponse(
    searchQuery,
    setSearchParams,
    defaultInit,
  );

  return [searchQueryWithDefaultUntilFirstSet, setSearchQuery];
}

function useDefaultResponse<TSchema extends UrlQueryMap = UrlQueryMap>(
  search: TSchema | undefined,
  setter: SetURLSearchParams,
  defaultInit?: TSchema,
): TSchema | undefined {
  const defaultInitRef = useRef(defaultInit);
  defaultInitRef.current = defaultInit;
  const firstResponse = useRef(true);

  useLayoutEffect(() => {
    if (defaultInitRef.current != null) {
      setter(qs.stringify(defaultInitRef.current, { addQueryPrefix: false }), {
        replace: true,
      });
      firstResponse.current = false;
    }
  }, []);

  const withDefault = firstResponse.current ? defaultInitRef.current : search;
  return defaultInit == null ? search : withDefault;
}

export { type UseUrlQueryResponse, type UrlQueryMap, useUrlQuery };
