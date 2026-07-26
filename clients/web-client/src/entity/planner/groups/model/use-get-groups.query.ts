import { useQuery } from '@apollo/client/react';
import { Override } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeGetGroupListOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { GroupId } from './domain';
import { GetGroupListQuery } from './schemas/groups.schema.generated';

type GroupListItem = Override<GetGroupListQuery['getGroupList']['items'][0], { id: GroupId }>;
const GROUPS_EMPTY: GroupListItem[] = [];

type Query = Override<
  GetGroupListQuery,
  {
    getGroupList: Override<GetGroupListQuery['getGroupList'], { items: GroupListItem[] }>;
  }
>;

function useGetGroupList({ limit, cursor, search }: { limit: number; cursor?: string; search?: string }) {
  const result = useQuery(...shapeGetGroupListOptions<Query>({ limit, cursor, search }).query());

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
