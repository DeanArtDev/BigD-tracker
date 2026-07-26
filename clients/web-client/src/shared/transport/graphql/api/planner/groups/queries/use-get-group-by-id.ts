import { useQuery } from '@apollo/client/react';
import { Brand } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '../../../../utils';
import { shapeGetGroupByIdOptions } from '../options';

function useGetGroupById<BrandGroup extends Brand<number, string>>({ groupId }: { groupId?: BrandGroup }) {
  const result = useQuery(...shapeGetGroupByIdOptions<BrandGroup>({ groupId }).query());

  const initialLoading = result.networkStatus === 1 && result.data == null;

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({
    exception: appErrors.at(-1),
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
