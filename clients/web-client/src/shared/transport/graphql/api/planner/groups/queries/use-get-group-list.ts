import { useQuery } from '@apollo/client/react';
import { Brand } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '../../../../utils';
import { shapeGetGroupListOptions } from '../options';

const GROUPS_EMPTY: never[] = [];

function useGetGroupList<BrandGroup extends Brand<number, string>>({
  limit,
  cursor,
  search,
}: {
  limit: number;
  cursor?: string;
  search?: string;
}) {
  const result = useQuery(...shapeGetGroupListOptions<BrandGroup>({ limit, cursor, search }).query());

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

export { useGetGroupList };
