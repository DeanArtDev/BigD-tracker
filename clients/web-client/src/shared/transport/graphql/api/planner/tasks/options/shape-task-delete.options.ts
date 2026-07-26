import { AppMutationOptionsResponse } from '../../../types';
import { DeleteTaskDocument, DeleteTaskMutationVariables, DeleteTaskMutation } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<DeleteTaskMutation, DeleteTaskMutationVariables>;

function shapeTaskDeleteOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [DeleteTaskDocument, options];
}

shapeTaskDeleteOptions.document = DeleteTaskDocument;

export { shapeTaskDeleteOptions };
