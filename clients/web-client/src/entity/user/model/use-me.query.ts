import { useAppQuery } from '@/shared/transport/graphql';
import { MeDocument } from './schemas/queries.generated';

function useMeQuery() {
  return useAppQuery(MeDocument, { endpoint: 'private' });
}

export { useMeQuery };
