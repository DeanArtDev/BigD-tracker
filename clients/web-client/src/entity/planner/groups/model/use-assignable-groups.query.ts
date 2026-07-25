import { useQuery } from '@apollo/client/react';
import { keyBy } from 'lodash-es';
import { useMemo } from 'react';
import { Override } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { BrandGroup } from './domain';
import { GetAssignableGroupsDocument, GetAssignableGroupsQuery } from './schemas/groups.schema.generated';

type GroupInfo = BrandGroup<GetAssignableGroupsQuery['getAssignableGroups'][0]>;
const GROUPS_EMPTY: GroupInfo[] = [];

type Query = Override<GetAssignableGroupsQuery, { getAssignableGroups: GroupInfo[] }>;

function useGetAssignableGroups() {
  const result = useQuery<Query>(GetAssignableGroupsDocument, {
    context: { endpoint: 'private' },
  });

  const initialLoading = result.networkStatus === 1 && result.data == null;

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  const items = result.data?.getAssignableGroups ?? GROUPS_EMPTY;

  return {
    ...result,
    isError,
    initialLoading,
    isEmpty: !initialLoading && !result.loading && (result.data?.getAssignableGroups?.length ?? 0) <= 0,
    groups: { items, byId: useMemo(() => keyBy(items, 'id'), [items]) },
  };
}

export { useGetAssignableGroups, type GroupInfo };
