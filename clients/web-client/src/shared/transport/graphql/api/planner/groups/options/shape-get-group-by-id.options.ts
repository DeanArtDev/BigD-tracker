import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { GetGroupByIdDocument, GetGroupByIdQueryVariables, GetGroupByIdQuery } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetGroupByIdQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetGroupByIdQueryVariables>;

function shapeGetGroupByIdOptions<TData = GetGroupByIdQuery>(input: { groupId?: number }) {
  return {
    query: (additionalOptions?: Partial<OptionsResponse<TData>[1]>): OptionsResponse<TData> => {
      const options: OptionsResponse<TData>[1] = {
        ...additionalOptions,
        variables: { input: { groupId: input.groupId! } },
        skip: input.groupId == null,
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetGroupByIdDocument, options];
    },

    suspense: (additionalOptions?: Partial<OptionsSuspenseResponse<TData>[1]>): OptionsSuspenseResponse<TData> => {
      const options: OptionsSuspenseResponse<TData>[1] = {
        ...additionalOptions,
        variables: { input: { groupId: input.groupId! } },
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetGroupByIdDocument, options];
    },
  };
}

shapeGetGroupByIdOptions.document = GetGroupByIdDocument;

export { shapeGetGroupByIdOptions };
