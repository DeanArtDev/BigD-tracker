import { Brand, DeepReadonly, Override } from '@/shared/lib';
import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { GetDiaryGroupListDocument, GetDiaryGroupListQuery, GetDiaryGroupListQueryVariables } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetDiaryGroupListQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetDiaryGroupListQueryVariables>;

type DiaryGroupDto = GetDiaryGroupListQuery['getDiaryGroupList'][number];

type DiaryGroup<BrandGroup extends Brand<number, string>> = Override<
  DeepReadonly<DiaryGroupDto>,
  { readonly id: BrandGroup }
>;

type DiaryGroupListQuery<BrandGroup extends Brand<number, string>> = Override<
  GetDiaryGroupListQuery,
  { readonly getDiaryGroupList: DiaryGroup<BrandGroup>[] }
>;

function shapeGetDiaryGroupListOptions<
  BrandGroup extends Brand<number, string>,
  TData = DiaryGroupListQuery<BrandGroup>,
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

      return [GetDiaryGroupListDocument, options];
    },

    suspense: (additionalOptions?: Partial<OptionsSuspenseResponse<TData>[1]>): OptionsSuspenseResponse<TData> => {
      const options: OptionsSuspenseResponse<TData>[1] = {
        ...additionalOptions,
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetDiaryGroupListDocument, options];
    },
  };
}

shapeGetDiaryGroupListOptions.document = GetDiaryGroupListDocument;

export { shapeGetDiaryGroupListOptions, type DiaryGroup, type DiaryGroupListQuery };
