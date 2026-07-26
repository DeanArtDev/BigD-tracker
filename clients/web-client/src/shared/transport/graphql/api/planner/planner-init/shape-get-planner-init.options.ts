import { Brand, Override } from '@/shared/lib';
import { GetPlannerInitDocument, GetPlannerInitQueryVariables, GetPlannerInitQuery } from './schemas';
import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../types';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetPlannerInitQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetPlannerInitQueryVariables>;

type InitQuery<BrandGroup extends Brand<number, string>> = Override<
  GetPlannerInitQuery,
  {
    getPlannerInit: Override<GetPlannerInitQuery['getPlannerInit'], { inboxId: BrandGroup }>;
  }
>;

function shapeGetPlannerInitOptions<BrandGroup extends Brand<number, string>, TData = InitQuery<BrandGroup>>() {
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
