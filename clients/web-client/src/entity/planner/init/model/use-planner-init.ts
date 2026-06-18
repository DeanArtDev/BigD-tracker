import { useQuery } from '@apollo/client/react';
import { GroupId } from '@/entity/planner/groups';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import {
  GetPlannerInitDocument,
  GetPlannerInitQuery,
  GetPlannerInitQueryVariables,
} from './schemas/init.schema.generated';

function usePlannerInit() {
  const result = useQuery<GetPlannerInitQuery, GetPlannerInitQueryVariables>(GetPlannerInitDocument, {
    context: { endpoint: 'private' },
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const initialLoading = result.networkStatus === 1 && result.data == null;

  return {
    ...result,
    initialLoading,
    data: {
      inbox: {
        id: result.data?.getPlannerInit.inboxId as GroupId,
        taskCount: result.data?.getPlannerInit.inboxTaskCount,
      },
    },
    ...useExtendApolloErrorResult(result.error),
  };
}

export { usePlannerInit };
