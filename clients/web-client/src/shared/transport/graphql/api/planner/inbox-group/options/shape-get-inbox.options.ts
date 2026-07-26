import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { GetInboxDocument, GetInboxQueryVariables, GetInboxQuery } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetInboxQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetInboxQueryVariables>;

function shapeGetInboxOptions<TData = GetInboxQuery>(input: GetInboxQueryVariables['input']) {
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

      return [GetInboxDocument, options];
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

      return [GetInboxDocument, options];
    },
  };
}

shapeGetInboxOptions.document = GetInboxDocument;

export { shapeGetInboxOptions };
