import { query } from '@/shared/transport/graphql/server';
import { ME_QUERY } from './schemas/queries';
import { MeQuery } from './schemas/queries.generated';

function meQuery() {
  return query<MeQuery>({
    query: ME_QUERY,
    errorPolicy: 'all',
    context: { endpoint: 'public-cookies-include' },
  });
}

export { meQuery };
