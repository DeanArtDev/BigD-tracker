import { ApolloClient } from '@apollo/client';

async function invalidatePlannerInit(cache: ApolloClient['cache']) {
  cache.evict({
    id: 'ROOT_QUERY',
    fieldName: 'getPlannerInit',
  });
}

export { invalidatePlannerInit };
