import { AppMutationOptionsResponse } from '../../../types';
import { CreateGroupDocument, CreateGroupMutationVariables, CreateGroupMutation } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<CreateGroupMutation, CreateGroupMutationVariables>;

function shapeGroupCreateOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [CreateGroupDocument, options];
}

shapeGroupCreateOptions.document = CreateGroupDocument;

export { shapeGroupCreateOptions };
