import { useAppQuery } from '@/shared/transport/graphql';
import { MeDocument, MeQuery } from './schemas/queries.generated';

function useMeQuery() {
  return useAppQuery<MeQuery>(MeDocument, { endpoint: 'private' });
}

export { useMeQuery };
