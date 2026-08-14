import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { Brand } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '../../../../utils';
import { shapeGetDiaryTasksOptions } from '../options';
import { GetDiaryTasksQueryVariables } from '../schemas';

const EMPTY: never[] = [];

function useGetDiaryTasks<BrandTask extends Brand<string, string>, BrandGroup extends Brand<number, string>>(
  input?: GetDiaryTasksQueryVariables['input'],
) {
  const result = useQuery(...shapeGetDiaryTasksOptions<BrandTask, BrandGroup>(input!).query({ skip: input == null }));

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return {
    ...result,
    tasks: useMemo(() => {
      return (result?.data?.getDiaryTasks ?? EMPTY).filter((task) => {
        return task.startDate != null && task.deadline != null;
      });
    }, [result?.data?.getDiaryTasks]),
    isError,
  };
}

export { useGetDiaryTasks };
