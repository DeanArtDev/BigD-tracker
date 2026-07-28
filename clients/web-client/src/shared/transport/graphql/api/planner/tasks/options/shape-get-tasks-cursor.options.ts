import { Brand, DeepReadonly, Override } from '@/shared/lib';
import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { GetTasksCursorDocument, GetTasksCursorQuery, GetTasksCursorQueryVariables } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetTasksCursorQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetTasksCursorQueryVariables>;

type TaskListItemDto = GetTasksCursorQuery['getTasksCursor']['items'][number];

type TaskCursorListItem<BrandGroup extends Brand<number, string>, BrandTask extends Brand<string, string>> = Override<
  DeepReadonly<TaskListItemDto>,
  {
    readonly id: BrandTask;
    readonly groupId?: BrandGroup;
  }
>;

type TasksCursorQuery<BrandGroup extends Brand<number, string>, BrandTask extends Brand<string, string>> = Override<
  GetTasksCursorQuery,
  {
    readonly getTasksCursor: Override<
      GetTasksCursorQuery['getTasksCursor'],
      {
        readonly items: TaskCursorListItem<BrandGroup, BrandTask>[];
      }
    >;
  }
>;

function shapeGetTasksCursorOptions<
  BrandGroup extends Brand<number, string>,
  BrandTask extends Brand<string, string>,
  TData = TasksCursorQuery<BrandGroup, BrandTask>,
>(input: GetTasksCursorQueryVariables['input']) {
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

      return [GetTasksCursorDocument, options];
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

      return [GetTasksCursorDocument, options];
    },
  };
}

shapeGetTasksCursorOptions.document = GetTasksCursorDocument;

export { shapeGetTasksCursorOptions, type TaskCursorListItem };
