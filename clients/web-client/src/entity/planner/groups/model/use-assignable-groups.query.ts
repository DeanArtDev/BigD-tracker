import { useQuery } from '@apollo/client/react';
import { Override } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { BrandGroup } from './domain';
import { GetAssignableGroupsDocument, GetAssignableGroupsQuery } from './schemas/inbox.schema.generated';

type GroupInfo = BrandGroup<GetAssignableGroupsQuery['getAssignableGroups'][0]>;
const GROUPS_EMPTY: GroupInfo[] = [];

type Query = Override<GetAssignableGroupsQuery, { getAssignableGroups: GroupInfo[] }>;

function useGetAssignableGroups({ skip }: { skip?: boolean } = {}) {
  const result = useQuery<Query>(GetAssignableGroupsDocument, {
    context: { endpoint: 'private' },
    skip,
  });

  const initialLoading = result.networkStatus === 1 && result.data == null;

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return {
    ...result,
    isError,
    initialLoading,
    isEmpty: !initialLoading && !result.loading && (result.data?.getAssignableGroups?.length ?? 0) <= 0,
    groups: result.data?.getAssignableGroups ?? GROUPS_EMPTY,
  };
}

export { useGetAssignableGroups, type GroupInfo };
