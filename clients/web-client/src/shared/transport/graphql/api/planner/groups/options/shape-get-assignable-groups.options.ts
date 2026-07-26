import { Brand, DeepReadonly, Override } from '@/shared/lib';
import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { GetAssignableGroupsDocument, GetAssignableGroupsQuery, GetAssignableGroupsQueryVariables } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetAssignableGroupsQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetAssignableGroupsQueryVariables>;

type AssignableGroupDto = GetAssignableGroupsQuery['getAssignableGroups'][number];

type AssignableGroup<BrandGroup extends Brand<number, string>> = Override<
  DeepReadonly<AssignableGroupDto>,
  { readonly id: BrandGroup }
>;

type AssignableGroupsQuery<BrandGroup extends Brand<number, string>> = Override<
  GetAssignableGroupsQuery,
  { readonly getAssignableGroups: AssignableGroup<BrandGroup>[] }
>;

function shapeGetAssignableGroupsOptions<
  BrandGroup extends Brand<number, string>,
  TData = AssignableGroupsQuery<BrandGroup>,
>() {
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

export { shapeGetAssignableGroupsOptions, type AssignableGroup };
