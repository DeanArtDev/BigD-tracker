import { AppQueryOptionsResponse } from '../types';
import {
  GetAssignableTasksQueryVariables,
  GetAssignableTasksQuery,
  GetAssignableTasksDocument,
} from './schema/task.schema.generated';

type OptionsResponse = AppQueryOptionsResponse<GetAssignableTasksQuery, GetAssignableTasksQueryVariables>;

function shapeGetAssignableTasksOptions(
  input: { search?: string; groupIds?: number[] },
  additionalOptions?: Partial<OptionsResponse[1]>,
): OptionsResponse {
  const options: OptionsResponse[1] = {
    ...additionalOptions,
    variables: { input: { search: input.search!, groupIds: input.groupIds } },
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [GetAssignableTasksDocument, options];
}

export { shapeGetAssignableTasksOptions };
