import { useQuery } from '@apollo/client/react';
import { keyBy } from 'lodash-es';
import { useMemo } from 'react';
import { Brand } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '../../../../utils';
import { shapeGetAssignableGroupsOptions } from '../options';

const GROUPS_EMPTY: never[] = [];

function useGetAssignableGroups<BrandGroup extends Brand<number, string>>() {
  const result = useQuery(...shapeGetAssignableGroupsOptions<BrandGroup>().query());

  const initialLoading = result.networkStatus === 1 && result.data == null;

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  const items = result.data?.getAssignableGroups ?? GROUPS_EMPTY;

  return {
    ...result,
    isError,
    initialLoading,
    isEmpty: !initialLoading && !result.loading && items.length <= 0,
    groups: { items, byId: useMemo(() => keyBy(items, 'id'), [items]) },
  };
}

export { useGetAssignableGroups };
