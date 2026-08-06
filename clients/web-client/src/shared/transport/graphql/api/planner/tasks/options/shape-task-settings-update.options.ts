import { AppMutationOptionsResponse } from '../../../types';
import {
  UpdateTaskSettingsDocument,
  UpdateTaskSettingsMutation,
  UpdateTaskSettingsMutationVariables,
} from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<UpdateTaskSettingsMutation, UpdateTaskSettingsMutationVariables>;

function shapeTaskSettingsUpdateOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [UpdateTaskSettingsDocument, options];
}

shapeTaskSettingsUpdateOptions.document = UpdateTaskSettingsDocument;

export { shapeTaskSettingsUpdateOptions };
