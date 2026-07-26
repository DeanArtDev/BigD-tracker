import { Brand, Override } from '@/shared/lib';
import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { GetGroupByIdDocument, GetGroupByIdQuery, GetGroupByIdQueryVariables } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetGroupByIdQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetGroupByIdQueryVariables>;

type GroupById<BrandGroup extends Brand<number, string>> = Override<
  GetGroupByIdQuery['getGroup'],
  { readonly id: BrandGroup }
>;

type GroupByIdQuery<BrandGroup extends Brand<number, string>> = Override<
  GetGroupByIdQuery,
  { readonly getGroup: GroupById<BrandGroup> }
>;

function shapeGetGroupByIdOptions<BrandGroup extends Brand<number, string>, TData = GroupByIdQuery<BrandGroup>>(input: {
  groupId?: BrandGroup;
}) {
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

export { shapeGetGroupByIdOptions, type GroupById };
