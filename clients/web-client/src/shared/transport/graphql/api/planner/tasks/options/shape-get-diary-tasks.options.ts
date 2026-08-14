import { Brand, DeepReadonly, Override } from '@/shared/lib';
import { AppQueryOptionsResponseMap } from '../../../types';
import { GetDiaryTasksDocument, GetDiaryTasksQuery, GetDiaryTasksQueryVariables } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponseMap<TData, GetDiaryTasksQueryVariables>;

type DiaryTaskDto = GetDiaryTasksQuery['getDiaryTasks'][number];

type DiaryTask<BrandGroup extends Brand<number, string>, BrandTask extends Brand<string, string>> = Override<
  DeepReadonly<DiaryTaskDto>,
  {
    readonly id: BrandTask;
    readonly startDate: string;
    readonly deadline: string;
    readonly groupId?: BrandGroup;
  }
>;

type DiaryTasksQuery<BrandGroup extends Brand<number, string>, BrandTask extends Brand<string, string>> = Override<
  GetDiaryTasksQuery,
  {
    readonly getDiaryTasks: DiaryTask<BrandGroup, BrandTask>[];
  }
>;

function shapeGetDiaryTasksOptions<
  BrandTask extends Brand<string, string>,
  BrandGroup extends Brand<number, string>,
  TData = DiaryTasksQuery<BrandGroup, BrandTask>,
>(input: GetDiaryTasksQueryVariables['input']) {
  return {
    query: (additionalOptions?: Partial<OptionsResponse<TData>['query'][1]>): OptionsResponse<TData>['query'] => {
      const options: OptionsResponse<TData>['query'][1] = {
        ...additionalOptions,
        variables: { input },
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetDiaryTasksDocument, options];
    },

    suspense: (
      additionalOptions?: Partial<OptionsResponse<TData>['suspense'][1]>,
    ): OptionsResponse<TData>['suspense'] => {
      const options: OptionsResponse<TData>['suspense'][1] = {
        ...additionalOptions,
        variables: { input },
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetDiaryTasksDocument, options];
    },

    lazy: (additionalOptions?: Partial<OptionsResponse<TData>['lazy']>): OptionsResponse<TData>['lazy'] => {
      return {
        ...additionalOptions,
        variables: { input },
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };
    },
  };
}

shapeGetDiaryTasksOptions.document = GetDiaryTasksDocument;

export { shapeGetDiaryTasksOptions, type DiaryTask, type DiaryTasksQuery };
