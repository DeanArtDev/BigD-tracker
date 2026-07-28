import { useQuery } from '@apollo/client/react';
import { Brand } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '../../../../utils';
import { shapeGetTasksCursorOptions } from '../options';
import { GetTasksCursorQueryVariables } from '../schemas';

const TASKS_EMPTY: never[] = [];

function useGetTasksCursor<BrandGroup extends Brand<number, string>, BrandTask extends Brand<string, string>>(
  input: GetTasksCursorQueryVariables['input'],
) {
  const result = useQuery(
    ...shapeGetTasksCursorOptions<BrandGroup, BrandTask>(input).query({
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
    }),
  );

  const initialLoading = result.networkStatus === 1 && result.data == null;

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return {
    ...result,
    isError,
    initialLoading,
    meta: result.data?.getTasksCursor.meta,
    isEmpty: !initialLoading && !result.loading && (result.data?.getTasksCursor.items.length ?? 0) <= 0,
    tasks: result.data?.getTasksCursor.items ?? TASKS_EMPTY,
  };
}

export { useGetTasksCursor };
