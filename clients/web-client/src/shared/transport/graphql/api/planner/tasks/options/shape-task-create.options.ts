import { AppMutationOptionsResponse } from '../../../types';
import { CreateTaskDocument, CreateTaskMutationVariables, CreateTaskMutation } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<CreateTaskMutation, CreateTaskMutationVariables>;

function shapeTaskCreateOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [CreateTaskDocument, options];
}

shapeTaskCreateOptions.document = CreateTaskDocument;

export { shapeTaskCreateOptions };
