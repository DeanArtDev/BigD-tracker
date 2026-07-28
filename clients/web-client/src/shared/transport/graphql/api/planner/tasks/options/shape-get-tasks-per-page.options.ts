import { Brand, DeepReadonly, Override } from '@/shared/lib';
import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { GetTasksPerPageDocument, GetTasksPerPageQuery, GetTasksPerPageQueryVariables } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetTasksPerPageQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetTasksPerPageQueryVariables>;

type TaskListItemDto = GetTasksPerPageQuery['getTasksPerPage']['items'][number];

type TaskPerPageListItem<BrandGroup extends Brand<number, string>, BrandTask extends Brand<string, string>> = Override<
  DeepReadonly<TaskListItemDto>,
  {
    readonly id: BrandTask;
    readonly groupId?: BrandGroup;
  }
>;

type TasksPerPageQuery<BrandGroup extends Brand<number, string>, BrandTask extends Brand<string, string>> = Override<
  GetTasksPerPageQuery,
  {
    readonly getTasksPerPage: Override<
      GetTasksPerPageQuery['getTasksPerPage'],
      {
        readonly items: TaskPerPageListItem<BrandGroup, BrandTask>[];
      }
    >;
  }
>;

function shapeGetTasksPerPageOptions<
  BrandGroup extends Brand<number, string>,
  BrandTask extends Brand<string, string>,
  TData = TasksPerPageQuery<BrandGroup, BrandTask>,
>(input: GetTasksPerPageQueryVariables['input']) {
  return {
    query: (additionalOptions?: Partial<OptionsResponse<TData>[1]>): OptionsResponse<TData> => {
      const options: OptionsResponse<TData>[1] = {
        ...additionalOptions,
        variables: { input },
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetTasksPerPageDocument, options];
    },

    suspense: (additionalOptions?: Partial<OptionsSuspenseResponse<TData>[1]>): OptionsSuspenseResponse<TData> => {
      const options: OptionsSuspenseResponse<TData>[1] = {
        ...additionalOptions,
        variables: { input },
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetTasksPerPageDocument, options];
    },
  };
}

shapeGetTasksPerPageOptions.document = GetTasksPerPageDocument;

export { shapeGetTasksPerPageOptions, type TaskPerPageListItem };
