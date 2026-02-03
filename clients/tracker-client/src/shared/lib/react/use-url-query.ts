import { isEmpty } from 'lodash-es';
import qs from 'qs';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { type SetURLSearchParams, useLocation, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

type UrlAllowedQueryTypes = z.ZodObject<{ [key: string]: z.ZodType }>;

type TValue<TSchema extends UrlAllowedQueryTypes> = z.infer<TSchema>;

type UseUrlQueryResponse<TSchema extends UrlAllowedQueryTypes> = readonly [
  TValue<TSchema> | undefined,
  (value: TValue<TSchema>) => void,
];

function useUrlQuery<TSchema extends UrlAllowedQueryTypes = UrlAllowedQueryTypes>(
  schema: TSchema,
  defaultInit?: TValue<TSchema>,
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
    const successData = parsed.success && !isEmpty(parsed.data) ? parsed.data : undefined;
    return successData as TValue<TSchema>;
  }, [currentQuery, schema]);

  const searchQueryWithDefaultUntilFirstSet = useDefaultResponse<TSchema>(
    searchQuery,
    setSearchParams,
    defaultInit,
  );

  return [searchQueryWithDefaultUntilFirstSet, setSearchQuery];
}

function useDefaultResponse<TSchema extends UrlAllowedQueryTypes>(
  search: TValue<TSchema> | undefined,
  setter: SetURLSearchParams,
  defaultInit?: TValue<TSchema>,
): TValue<TSchema> | undefined {
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

export { type UseUrlQueryResponse, type UrlAllowedQueryTypes, useUrlQuery };
