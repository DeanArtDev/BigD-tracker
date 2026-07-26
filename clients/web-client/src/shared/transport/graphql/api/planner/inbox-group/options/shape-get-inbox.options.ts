import { Brand, DeepReadonly, Override } from '@/shared/lib';
import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import { GetInboxDocument, GetInboxQuery, GetInboxQueryVariables } from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetInboxQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetInboxQueryVariables>;

type InboxTaskDto = GetInboxQuery['getInbox']['tasks']['items'][number];

type InboxTask<BrandGroup extends Brand<number, string>, BrandTask extends Brand<string, string>> = Override<
  DeepReadonly<InboxTaskDto>,
  {
    readonly id: BrandTask;
    readonly groupId?: BrandGroup;
  }
>;

type InboxQuery<BrandGroup extends Brand<number, string>, BrandTask extends Brand<string, string>> = Override<
  GetInboxQuery,
  {
    readonly getInbox: Override<
      GetInboxQuery['getInbox'],
      {
        readonly id: BrandGroup;
        readonly tasks: Override<
          GetInboxQuery['getInbox']['tasks'],
          {
            readonly items: InboxTask<BrandGroup, BrandTask>[];
          }
        >;
      }
    >;
  }
>;

function shapeGetInboxOptions<
  BrandGroup extends Brand<number, string>,
  BrandTask extends Brand<string, string>,
  TData = InboxQuery<BrandGroup, BrandTask>,
>(input: GetInboxQueryVariables['input']) {
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

export { shapeGetInboxOptions, type InboxTask };
