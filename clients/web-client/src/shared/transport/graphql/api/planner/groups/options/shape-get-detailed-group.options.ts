import { GroupTaskOrder } from '@/entity/schema-types';
import { AppQueryOptionsResponse } from '../../../types';
import {
  GetDetailedGroupByIdDocument,
  GetDetailedGroupByIdQuery,
  GetDetailedGroupByIdQueryVariables,
} from '../schemas';

type OptionsResponse = AppQueryOptionsResponse<GetDetailedGroupByIdQuery, GetDetailedGroupByIdQueryVariables>;

function shapeGetDetailedGroupOptions(
  input: { groupId: number; order?: GroupTaskOrder },
  additionalOptions?: Partial<OptionsResponse[1]>,
): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    variables: { input: { groupId: input.groupId! }, tasksInput: { order: input.order } },
    skip: input.groupId == null,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [GetDetailedGroupByIdDocument, options];
}

shapeGetDetailedGroupOptions.document = GetDetailedGroupByIdDocument;

export { shapeGetDetailedGroupOptions };
