import { AppMutationOptionsResponse } from '../../../types';
import {
  UpdateGroupSettingsDocument,
  UpdateGroupSettingsMutation,
  UpdateGroupSettingsMutationVariables,
} from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<UpdateGroupSettingsMutation, UpdateGroupSettingsMutationVariables>;

function shapeGroupSettingsUpdateOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [UpdateGroupSettingsDocument, options];
}

shapeGroupSettingsUpdateOptions.document = UpdateGroupSettingsDocument;

export { shapeGroupSettingsUpdateOptions };
