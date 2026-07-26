import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { TaskByIdDocument, TaskByIdQueryVariables, TaskByIdQuery } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, TaskByIdQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, TaskByIdQueryVariables>;

function shapeGetTaskByIdOptions<TData = TaskByIdQuery>(input: { id?: string }) {
  return {
    query: (additionalOptions?: Partial<OptionsResponse<TData>[1]>): OptionsResponse<TData> => {
      const options: OptionsResponse<TData>[1] = {
        ...additionalOptions,
        variables: { input: { id: input.id! } },
        skip: input.id == null,
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [TaskByIdDocument, options];
    },

    suspense: (additionalOptions?: Partial<OptionsSuspenseResponse<TData>[1]>): OptionsSuspenseResponse<TData> => {
      const options: OptionsSuspenseResponse<TData>[1] = {
        ...additionalOptions,
        variables: { input: { id: input.id! } },
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [TaskByIdDocument, options];
    },
  };
}

shapeGetTaskByIdOptions.document = TaskByIdDocument;

export { shapeGetTaskByIdOptions };
