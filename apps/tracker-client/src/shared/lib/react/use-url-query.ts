import { isEmpty } from 'lodash-es';
import qs from 'qs';
import { ZodType } from 'zod';
import { useCallback, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

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
): UseUrlQueryResponse<TSchema> {
  const [search, setSearchParams] = useSearchParams();
  const currentQuery = useLocation().search;

  const searchQuery = useMemo(() => {
    const parsed = schema.safeParse(
      qs.parse(currentQuery, { ignoreQueryPrefix: true, interpretNumericEntities: true }),
    );
    return parsed.success && !isEmpty(parsed.data) ? parsed.data : undefined;
  }, [search, schema]);

  const setSearchQuery = useCallback<UseUrlQueryResponse<TSchema>[1]>(
    (value) => {
      const parsedCurrentQuery = qs.parse(currentQuery, { ignoreQueryPrefix: true });
      setSearchParams(
        qs.stringify({ ...parsedCurrentQuery, ...value }, { addQueryPrefix: true }),
      );
    },
    [currentQuery, setSearchParams],
  );

  return [searchQuery, setSearchQuery];
}

export { type UseUrlQueryResponse, type UrlQueryMap, useUrlQuery };
