import { GroupTaskOrder } from '../../../../schema-types';
import { AppQueryOptionsResponse, AppSuspenseQueryOptionsResponse } from '../../../types';
import {
  GetDetailedGroupByIdDocument,
  GetDetailedGroupByIdQuery,
  GetDetailedGroupByIdQueryVariables,
} from '../schemas';

type OptionsResponse<TData> = AppQueryOptionsResponse<TData, GetDetailedGroupByIdQueryVariables>;
type OptionsSuspenseResponse<TData> = AppSuspenseQueryOptionsResponse<TData, GetDetailedGroupByIdQueryVariables>;

function shapeGetDetailedGroupOptions<TData = GetDetailedGroupByIdQuery>(input: {
  groupId?: number;
  order?: GroupTaskOrder;
}) {
  return {
    query: (additionalOptions?: Partial<OptionsResponse<TData>[1]>): OptionsResponse<TData> => {
      const options: OptionsResponse<TData>[1] = {
        errorPolicy: 'all',
        ...additionalOptions,
        variables: { input: { groupId: input.groupId! }, tasksInput: { order: input.order } },
        skip: input.groupId == null,
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetDetailedGroupByIdDocument, options];
    },

    suspense: (additionalOptions?: Partial<OptionsSuspenseResponse<TData>[1]>): OptionsSuspenseResponse<TData> => {
      const options: OptionsSuspenseResponse<TData>[1] = {
        errorPolicy: 'all',
        ...additionalOptions,
        variables: { input: { groupId: input.groupId! }, tasksInput: { order: input.order } },
        context: {
          ...additionalOptions?.context,
          endpoint: 'private',
        },
      };

      return [GetDetailedGroupByIdDocument, options];
    },
  };
}

shapeGetDetailedGroupOptions.document = GetDetailedGroupByIdDocument;

export { shapeGetDetailedGroupOptions };
