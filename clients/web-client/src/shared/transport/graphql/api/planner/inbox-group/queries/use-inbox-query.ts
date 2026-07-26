import { useQuery } from '@apollo/client/react';
import { Brand } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { TaskPriority, TaskStatus } from '../../../../schema-types';
import { useExtendApolloErrorResult } from '../../../../utils';
import { shapeGetInboxOptions } from '../options';
import { GetInboxQueryVariables } from '../schemas';

const inboxInitialRequestVariables: {
  limit: NonNullable<GetInboxQueryVariables['input']>['limit'];
  cursor: NonNullable<GetInboxQueryVariables['input']>['cursor'];
} = {
  limit: 12,
  cursor: null,
};

function useInboxQuery<BrandGroup extends Brand<number, string>, BrandTask extends Brand<string, string>>(params?: {
  search?: string;
  filter?: {
    status?: TaskStatus[];
    priority?: TaskPriority[];
  };
}) {
  const result = useQuery(
    ...shapeGetInboxOptions<BrandGroup, BrandTask>({
      ...inboxInitialRequestVariables,
      search: params?.search,
      status: params?.filter?.status,
      priority: params?.filter?.priority,
    }).query({
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
    isEmpty: !initialLoading && !result.loading && (result.data?.getInbox.tasks.items.length ?? 0) <= 0,
    data: {
      id: result.data?.getInbox.id,
      name: result.data?.getInbox.name,
      tasks: result.data?.getInbox.tasks.items,
      meta: result.data?.getInbox.tasks.meta,
    },
  };
}

export { inboxInitialRequestVariables, useInboxQuery };
