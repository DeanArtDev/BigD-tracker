import { AppMutationOptionsResponse } from '../../types';
import { UserLoginDocument, UserLoginMutation, UserLoginMutationVariables } from '../schemas';

type OptionsResponse = AppMutationOptionsResponse<UserLoginMutation, UserLoginMutationVariables>;

function shapeUserLoginOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'public-cookies-include',
    },
  };

  return [UserLoginDocument, options];
}

shapeUserLoginOptions.document = UserLoginDocument;

export { shapeUserLoginOptions };
