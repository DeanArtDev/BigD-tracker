import { AppMutationOptionsResponse } from '../../../types';
import { TaskFinishDocument, TaskFinishMutationVariables, TaskFinishMutation } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<TaskFinishMutation, TaskFinishMutationVariables>;

function shapeTaskFinishOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [TaskFinishDocument, options];
}

shapeTaskFinishOptions.document = TaskFinishDocument;

export { shapeTaskFinishOptions };
