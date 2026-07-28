import { useQuery } from '@apollo/client/react';
import { Brand } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '../../../../utils';
import { shapeGetTasksPerPageOptions } from '../options';
import { GetTasksPerPageQueryVariables } from '../schemas';

const TASKS_EMPTY: never[] = [];

function useGetTasksPerPage<BrandGroup extends Brand<number, string>, BrandTask extends Brand<string, string>>(
  input: GetTasksPerPageQueryVariables['input'],
) {
  const result = useQuery(
    ...shapeGetTasksPerPageOptions<BrandGroup, BrandTask>(input).query({
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
    meta: result.data?.getTasksPerPage.meta,
    isEmpty: !initialLoading && !result.loading && (result.data?.getTasksPerPage.items.length ?? 0) <= 0,
    tasks: result.data?.getTasksPerPage.items ?? TASKS_EMPTY,
  };
}

export { useGetTasksPerPage };
