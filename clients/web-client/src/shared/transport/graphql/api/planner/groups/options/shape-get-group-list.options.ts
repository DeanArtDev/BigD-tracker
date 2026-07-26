import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { GetGroupListDocument, GetGroupListQuery, GetGroupListQueryVariables } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetGroupListQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetGroupListQueryVariables>;

function shapeGetGroupListOptions<TData = GetGroupListQuery>({
  limit,
  cursor,
  search,
}: {
  limit: number;
  cursor?: string;
  search?: string;
}) {
  return {
    query: (additionalOptions?: Partial<OptionsResponse<TData>[1]>): OptionsResponse<TData> => {
      const options: OptionsResponse<TData>[1] = {
        ...additionalOptions,
        variables: { input: { limit, cursor, search } },
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetGroupListDocument, options];
    },

    suspense: (additionalOptions?: Partial<OptionsSuspenseResponse<TData>[1]>): OptionsSuspenseResponse<TData> => {
      const options: OptionsSuspenseResponse<TData>[1] = {
        ...additionalOptions,
        variables: { input: { limit, cursor, search } },
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetGroupListDocument, options];
    },
  };
}

shapeGetGroupListOptions.document = GetGroupListDocument;

export { shapeGetGroupListOptions };
