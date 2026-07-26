import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { GetAssignableTasksQueryVariables, GetAssignableTasksQuery, GetAssignableTasksDocument } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetAssignableTasksQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetAssignableTasksQueryVariables>;

function shapeGetAssignableTasksOptions<TData = GetAssignableTasksQuery>(input: {
  search?: string;
  groupIds?: number[];
}) {
  return {
    query: (additionalOptions?: Partial<OptionsResponse<TData>[1]>): OptionsResponse<TData> => {
      const options: OptionsResponse<TData>[1] = {
        ...additionalOptions,
        variables: { input: { search: input.search!, groupIds: input.groupIds } },
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetAssignableTasksDocument, options];
    },

    suspense: (additionalOptions?: Partial<OptionsSuspenseResponse<TData>[1]>): OptionsSuspenseResponse<TData> => {
      const options: OptionsSuspenseResponse<TData>[1] = {
        ...additionalOptions,
        variables: { input: { search: input.search!, groupIds: input.groupIds } },
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetAssignableTasksDocument, options];
    },
  };
}

shapeGetAssignableTasksOptions.document = GetAssignableTasksDocument;

export { shapeGetAssignableTasksOptions };
