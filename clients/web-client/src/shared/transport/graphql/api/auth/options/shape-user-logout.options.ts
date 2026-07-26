import { AppMutationOptionsResponse } from '../../types';
import { UserLogoutDocument, UserLogoutMutation, UserLogoutMutationVariables } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<UserLogoutMutation, UserLogoutMutationVariables>;

function shapeUserLogoutOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [UserLogoutDocument, options];
}

shapeUserLogoutOptions.document = UserLogoutDocument;

export { shapeUserLogoutOptions };
