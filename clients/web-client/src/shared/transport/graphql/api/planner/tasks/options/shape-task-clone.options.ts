import { AppMutationOptionsResponse } from '../../../types';
import { CloneTaskDocument, CloneTaskMutationVariables, CloneTaskMutation } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<CloneTaskMutation, CloneTaskMutationVariables>;

function shapeTaskCloneOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [CloneTaskDocument, options];
}

shapeTaskCloneOptions.document = CloneTaskDocument;

export { shapeTaskCloneOptions };
