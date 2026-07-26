import { AppMutationOptionsResponse } from '../../../types';
import { UpdateGroupDocument, UpdateGroupMutationVariables, UpdateGroupMutation } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<UpdateGroupMutation, UpdateGroupMutationVariables>;

function shapeGroupUpdateOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [UpdateGroupDocument, options];
}

shapeGroupUpdateOptions.document = UpdateGroupDocument;

export { shapeGroupUpdateOptions };
