import { useAppQuery } from '@/shared/transport/graphql';
import { MeDocument, MeQuery } from './schemas/queries.generated';

function useMeQuery() {
  const { data, ...rest } = useAppQuery<MeQuery>(MeDocument, { endpoint: 'private' });

  return {
    me: data?.me,
    ...rest,
  };
}

export { useMeQuery };
