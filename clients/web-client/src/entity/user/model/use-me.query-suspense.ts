import { useSuspenseQuery } from '@apollo/client/react';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { MeDocument, MeQuery } from './schemas/queries.generated';

function useMeSuspenseQuery() {
  const result = useSuspenseQuery<MeQuery>(MeDocument, { context: { endpoint: 'private' } });

  return {
    ...result,
    me: result.data?.me,
    ...useExtendApolloErrorResult(result.error),
  };
}

export { useMeSuspenseQuery };
