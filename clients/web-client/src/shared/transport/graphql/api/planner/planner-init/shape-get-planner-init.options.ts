import { GetPlannerInitDocument, GetPlannerInitQueryVariables, GetPlannerInitQuery } from './schemas';
import { AppQueryOptionsResponse } from '../../types';

type OptionsResponse = AppQueryOptionsResponse<GetPlannerInitQuery, GetPlannerInitQueryVariables>;

function shapeGetPlannerInitOptions(additionalOptions?: Partial<OptionsResponse[1]>): OptionsResponse {
  const options: OptionsResponse[1] = {
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [GetPlannerInitDocument, options];
}

shapeGetPlannerInitOptions.document = GetPlannerInitDocument;

export { shapeGetPlannerInitOptions };
