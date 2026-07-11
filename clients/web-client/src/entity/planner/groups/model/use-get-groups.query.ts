import { useQuery } from '@apollo/client/react';
import { Override } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { GroupId } from './domain';
import { GetGroupListQuery, GetGroupListQueryVariables, GetGroupListDocument } from './schemas/inbox.schema.generated';

type GroupListItem = Override<GetGroupListQuery['getGroupList']['items'][0], { id: GroupId }>;
const GROUPS_EMPTY: GroupListItem[] = [];

type Query = Override<
  GetGroupListQuery,
  {
    getGroupList: Override<GetGroupListQuery['getGroupList'], { items: GroupListItem[] }>;
  }
>;

function useGetGroupList({ limit, cursor, search }: { limit: number; cursor?: string; search?: string }) {
  const result = useQuery<Query, GetGroupListQueryVariables>(GetGroupListDocument, {
    context: { endpoint: 'private' },
    variables: { input: { limit, cursor, search } },
  });

  const initialLoading = result.networkStatus === 1 && result.data == null;

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return {
    ...result,
    isError,
    initialLoading,
    meta: result.data?.getGroupList.meta,
    isEmpty: !initialLoading && !result.loading && (result.data?.getGroupList.items.length ?? 0) <= 0,
    groups: result.data?.getGroupList.items ?? GROUPS_EMPTY,
  };
}

export { useGetGroupList, type GroupListItem };
