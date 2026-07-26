import { AppMutationOptionsResponse } from '../../../types';
import { CopyTaskDocument, CopyTaskMutationVariables, CopyTaskMutation } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<CopyTaskMutation, CopyTaskMutationVariables>;

function shapeTaskCopyOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [CopyTaskDocument, options];
}

shapeTaskCopyOptions.document = CopyTaskDocument;

export { shapeTaskCopyOptions };
