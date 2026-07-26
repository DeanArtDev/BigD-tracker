import { AppMutationOptionsResponse } from '../../../types';
import { UpdateTaskDocument, UpdateTaskMutationVariables, UpdateTaskMutation } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<UpdateTaskMutation, UpdateTaskMutationVariables>;

function shapeTaskUpdateOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [UpdateTaskDocument, options];
}

shapeTaskUpdateOptions.document = UpdateTaskDocument;

export { shapeTaskUpdateOptions };
