import { AppMutationOptionsResponse } from '../../../types';
import { TaskAssignDocument, TaskAssignMutationVariables, TaskAssignMutation } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<TaskAssignMutation, TaskAssignMutationVariables>;

function shapeTaskAssignOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [TaskAssignDocument, options];
}

shapeTaskAssignOptions.document = TaskAssignDocument;

export { shapeTaskAssignOptions };
