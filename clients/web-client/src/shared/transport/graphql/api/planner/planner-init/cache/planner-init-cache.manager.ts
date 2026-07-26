import { ApolloClient } from '@apollo/client';
import { GetPlannerInit } from '../../../../schema-types';
import { GetPlannerInitDocument } from '../schemas';

class PlannerInitCacheManager {
  static readonly #plannerInitTypename: GetPlannerInit['__typename'] = 'GetPlannerInit';

  static refetch(client: ApolloClient) {
    return client.refetchQueries({
      include: [GetPlannerInitDocument],
    });
  }
}

export { PlannerInitCacheManager };
