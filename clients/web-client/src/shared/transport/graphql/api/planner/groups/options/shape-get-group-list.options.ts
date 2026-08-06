import { Brand, Override } from '@/shared/lib';
import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { GetGroupListDocument, GetGroupListQuery, GetGroupListQueryVariables } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetGroupListQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetGroupListQueryVariables>;

type GroupListItemDto = GetGroupListQuery['getGroupList']['items'][number];

type GroupListItem<BrandGroup extends Brand<number, string>> = Override<GroupListItemDto, { readonly id: BrandGroup }>;

type GroupListQuery<BrandGroup extends Brand<number, string>> = Override<
  GetGroupListQuery,
  {
    readonly getGroupList: Override<GetGroupListQuery['getGroupList'], { readonly items: GroupListItem<BrandGroup>[] }>;
  }
>;

function shapeGetGroupListOptions<BrandGroup extends Brand<number, string>, TData = GroupListQuery<BrandGroup>>({
  limit,
  cursor,
  ids,
  search,
}: {
  limit: number;
  cursor?: string;
  ids?: BrandGroup[];
  search?: string;
}) {
  return {
    query: (additionalOptions?: Partial<OptionsResponse<TData>[1]>): OptionsResponse<TData> => {
      const options: OptionsResponse<TData>[1] = {
        ...additionalOptions,
        variables: { input: { limit, cursor, ids, search } },
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
        variables: { input: { limit, cursor, ids, search } },
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

export { shapeGetGroupListOptions, type GroupListItem };
