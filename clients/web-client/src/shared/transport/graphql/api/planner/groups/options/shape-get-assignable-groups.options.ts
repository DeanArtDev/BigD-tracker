import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { GetAssignableGroupsDocument, GetAssignableGroupsQueryVariables, GetAssignableGroupsQuery } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetAssignableGroupsQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetAssignableGroupsQueryVariables>;

function shapeGetAssignableGroupsOptions<TData = GetAssignableGroupsQuery>() {
  return {
    query: (additionalOptions?: Partial<OptionsResponse<TData>[1]>): OptionsResponse<TData> => {
      const options: OptionsResponse<TData>[1] = {
        ...additionalOptions,
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetAssignableGroupsDocument, options];
    },

    suspense: (additionalOptions?: Partial<OptionsSuspenseResponse<TData>[1]>): OptionsSuspenseResponse<TData> => {
      const options: OptionsSuspenseResponse<TData>[1] = {
        ...additionalOptions,
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetAssignableGroupsDocument, options];
    },
  };
}

shapeGetAssignableGroupsOptions.document = GetAssignableGroupsDocument;

export { shapeGetAssignableGroupsOptions };
