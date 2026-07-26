import { AppMutationOptionsResponse } from '../../../types';
import { TaskUnassignDocument, TaskUnassignMutationVariables, TaskUnassignMutation } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<TaskUnassignMutation, TaskUnassignMutationVariables>;

function shapeTaskUnassignOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [TaskUnassignDocument, options];
}

shapeTaskUnassignOptions.document = TaskUnassignDocument;

export { shapeTaskUnassignOptions };
