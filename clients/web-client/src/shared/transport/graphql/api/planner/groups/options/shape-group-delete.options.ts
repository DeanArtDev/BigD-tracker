import { AppMutationOptionsResponse } from '../../../types';
import { DeleteGroupDocument, DeleteGroupMutationVariables, DeleteGroupMutation } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<DeleteGroupMutation, DeleteGroupMutationVariables>;

function shapeGroupDeleteOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [DeleteGroupDocument, options];
}

shapeGroupDeleteOptions.document = DeleteGroupDocument;

export { shapeGroupDeleteOptions };
