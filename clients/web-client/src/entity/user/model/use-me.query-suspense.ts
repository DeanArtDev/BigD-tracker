import { useSuspenseQuery } from '@apollo/client/react';
import { MeDocument, MeQuery } from './schemas/queries.generated';

function useMeSuspenseQuery() {
  const { data, ...rest } = useSuspenseQuery<MeQuery>(MeDocument, { context: { endpoint: 'private' } });

  return {
    me: data?.me,
    ...rest,
  };
}

export { useMeSuspenseQuery };
