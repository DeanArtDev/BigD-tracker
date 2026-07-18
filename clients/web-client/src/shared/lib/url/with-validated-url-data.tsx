import { parse, stringify } from 'qs';
import { FunctionComponent } from 'react';
import z from 'zod';

interface Schema {
  readonly params?: z.ZodObject;
  readonly searchParams?: z.ZodObject;
}

interface ComponentProps<TSchema extends Schema = Schema> {
  params: z.infer<TSchema['params']>;
  searchParams?: z.infer<TSchema['searchParams']>;
}

function withValidatedUrlData<TSchema extends Schema = Schema>(
  schemas: TSchema,
  WrappedComponent: FunctionComponent<ComponentProps<TSchema>>,
  onWrongParams?: () => void,
) {
  const displayName = WrappedComponent?.displayName ?? WrappedComponent?.name ?? 'Component';

  return async function ValidatedPage({
    params,
    searchParams,
  }: {
    params: Promise<unknown>;
    searchParams?: Promise<unknown>;
  }) {
    const result: Pick<ComponentProps, 'params' | 'searchParams'> = {
      params: undefined,
      searchParams: undefined,
    };

    if (schemas.params != null) {
      const paramsResponse = await params;
      const paramsResult = schemas.params.safeParse(paramsResponse);
      if (!paramsResult.success) {
        onWrongParams?.();
        return null;
      }
      result.params = paramsResult.data;
    }

    if (schemas.searchParams != null) {
      const searchParamsResponse = await searchParams;
      const searchParamsResult = schemas.searchParams.safeParse(parse(stringify(searchParamsResponse)));
      result.searchParams = searchParamsResult.data;
    }

    WrappedComponent.displayName = `withValidatedPageParams${displayName}`;
    return (
      <WrappedComponent
        params={result.params as ComponentProps<TSchema>['params']}
        searchParams={result.searchParams as ComponentProps<TSchema>['searchParams']}
      />
    );
  };
}

export { withValidatedUrlData };
