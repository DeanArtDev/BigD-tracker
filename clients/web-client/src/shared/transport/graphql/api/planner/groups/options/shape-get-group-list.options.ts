import { AppQueryOptionsResponse } from '../../../types';
import { GetGroupListDocument, GetGroupListQuery, GetGroupListQueryVariables } from '../schemas';

type OptionsResponse = AppQueryOptionsResponse<GetGroupListQuery, GetGroupListQueryVariables>;

function shapeGetGroupListOptions(
  { limit, cursor, search }: { limit: number; cursor?: string; search?: string },
  additionalOptions?: Partial<OptionsResponse[1]>,
): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    variables: { input: { limit, cursor, search } },
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [GetGroupListDocument, options];
}

shapeGetGroupListOptions.document = GetGroupListDocument;

export { shapeGetGroupListOptions };
