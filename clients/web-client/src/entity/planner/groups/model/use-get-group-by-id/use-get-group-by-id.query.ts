import type { WatchQueryFetchPolicy } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { exceptionCode } from '@big-d/exceptions';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeGetGroupByIdOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { Query } from './types';

function useGetGroupById({ groupId }: { groupId?: number }, options?: { fetchPolicy: WatchQueryFetchPolicy }) {
  const result = useQuery(...shapeGetGroupByIdOptions<Query>({ groupId }).query(options));

  const initialLoading = result.networkStatus === 1 && result.data == null;

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({
    exception: appErrors.at(-1),
    messageHandlers: { [exceptionCode.groupNotFound.code]: () => 'Группа не найдена.' },
  });

  return {
    ...result,
    isError,
    initialLoading,
    isEmpty: !initialLoading && !result.loading && result.data?.getGroup == null,
    groupById: result.data?.getGroup,
  };
}

export { useGetGroupById };
