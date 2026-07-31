import { AppMutationOptionsResponse } from '../../../types';
import {
  CompleteDeleteTaskDocument,
  CompleteDeleteTaskMutation,
  CompleteDeleteTaskMutationVariables,
} from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<CompleteDeleteTaskMutation, CompleteDeleteTaskMutationVariables>;

function shapeTaskCompleteDeleteOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [CompleteDeleteTaskDocument, options];
}

shapeTaskCompleteDeleteOptions.document = CompleteDeleteTaskDocument;

export { shapeTaskCompleteDeleteOptions };
