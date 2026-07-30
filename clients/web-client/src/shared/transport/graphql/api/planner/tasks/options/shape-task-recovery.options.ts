import { AppMutationOptionsResponse } from '../../../types';
import { TaskRecoveryDocument, TaskRecoveryMutation, TaskRecoveryMutationVariables } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<TaskRecoveryMutation, TaskRecoveryMutationVariables>;

function shapeTaskRecoveryOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [TaskRecoveryDocument, options];
}

shapeTaskRecoveryOptions.document = TaskRecoveryDocument;

export { shapeTaskRecoveryOptions };
