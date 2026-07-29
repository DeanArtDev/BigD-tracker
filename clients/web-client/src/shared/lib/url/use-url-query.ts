'use client';

import { isEmpty, isFunction } from 'lodash-es';
import { usePathname, useSearchParams } from 'next/navigation';
import qs from 'qs';
import { type Dispatch, type SetStateAction, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { z } from 'zod';
import { getEnvConfigClient } from '@/shared/lib';
import { useIsMounted } from '@/shared/lib/application-status';

type UrlAllowedQueryTypes = z.ZodObject<{ [key: string]: z.ZodType }>;

type TValue<TSchema extends UrlAllowedQueryTypes> = z.infer<TSchema>;

type UseUrlQueryResponse<TSchema extends UrlAllowedQueryTypes> = readonly [
  TValue<TSchema> | undefined,
  Dispatch<SetStateAction<TValue<TSchema>>>,
];

const clientConfig = getEnvConfigClient();

function useUrlQuery<TSchema extends UrlAllowedQueryTypes = UrlAllowedQueryTypes>(
  schema: TSchema,
): UseUrlQueryResponse<TSchema> {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const pathname = usePathname();

  const setSearchQuery = useCallback<UseUrlQueryResponse<TSchema>[1]>(
    (value) => {
      const prevValue =
        schema.safeParse(
          qs.parse(queryString, {
            ignoreQueryPrefix: true,
            interpretNumericEntities: true,
          }),
        ).data! ?? {};

      const newValue = isFunction(value) ? value(prevValue) : value;
      const rawValuesResult = schema.safeParse(newValue);

      if (rawValuesResult.success) {
        const query = qs.stringify(rawValuesResult.data, { addQueryPrefix: true, skipNulls: true });
        history.replaceState(null, '', pathname + query);
      } else {
        if (clientConfig.IS_DEV || clientConfig.IS_TEST) {
          console.warn('SearchQuery data are not valid');
        }
      }
    },
    [pathname, queryString, schema],
  );

  const searchQuery = useMemo(() => {
    const parsed = schema.safeParse(qs.parse(queryString, { ignoreQueryPrefix: true, interpretNumericEntities: true }));
    const successData = parsed.success && !isEmpty(parsed.data) ? parsed.data : undefined;
    return successData as TValue<TSchema>;
  }, [queryString, schema]);

  return [searchQuery, setSearchQuery];
}

function useDefaultResponse<TSchema extends UrlAllowedQueryTypes>(defaultInit?: TValue<TSchema>) {
  const defaultInitRef = useRef(defaultInit);
  const firstResponse = useRef(true);

  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const pathname = usePathname();
  const isMounted = useIsMounted();

  useLayoutEffect(() => {
    if (defaultInitRef.current != null && !isMounted) {
      const prevValue = qs.parse(queryString, { ignoreQueryPrefix: true, interpretNumericEntities: true });
      const defaultQuery = qs.stringify(
        { ...prevValue, ...defaultInitRef.current },
        {
          addQueryPrefix: true,
          skipNulls: true,
        },
      );
      history.replaceState(null, '', pathname + defaultQuery);
      firstResponse.current = false;
    }
  }, [pathname, queryString, isMounted]);
}

export { type UseUrlQueryResponse, type UrlAllowedQueryTypes, useUrlQuery };
