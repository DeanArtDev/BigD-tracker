import { GetPlannerInitDocument, GetPlannerInitQueryVariables, GetPlannerInitQuery } from './schemas';
import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../types';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetPlannerInitQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetPlannerInitQueryVariables>;

function shapeGetPlannerInitOptions<TData = GetPlannerInitQuery>() {
  return {
    query: (additionalOptions?: Partial<OptionsResponse<TData>[1]>): OptionsResponse<TData> => {
      const options: OptionsResponse<TData>[1] = {
        errorPolicy: 'ignore',
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
        ...additionalOptions,
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetPlannerInitDocument, options];
    },

    suspense: (additionalOptions?: Partial<OptionsSuspenseResponse<TData>[1]>): OptionsSuspenseResponse<TData> => {
      const options: OptionsSuspenseResponse<TData>[1] = {
        errorPolicy: 'ignore',
        fetchPolicy: 'cache-first',
        ...additionalOptions,
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetPlannerInitDocument, options];
    },
  };
}

shapeGetPlannerInitOptions.document = GetPlannerInitDocument;

export { shapeGetPlannerInitOptions };
