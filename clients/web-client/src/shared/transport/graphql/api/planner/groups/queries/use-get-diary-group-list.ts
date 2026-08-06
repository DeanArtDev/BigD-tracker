import { useQuery } from '@apollo/client/react';
import { Brand } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '../../../../utils';
import { shapeGetDiaryGroupListOptions } from '../options';

const EMPTY: never[] = [];

function useGetDiaryGroupList<BrandGroup extends Brand<number, string>>() {
  const result = useQuery(...shapeGetDiaryGroupListOptions<BrandGroup>().query());
  const { appErrors, isError } = useExtendApolloErrorResult(result.error);

  useExceptionNotificator({ exception: appErrors.at(-1) });

  return {
    ...result,
    groups: result.data?.getDiaryGroupList ?? EMPTY,
    isError,
  };
}

export { useGetDiaryGroupList };
