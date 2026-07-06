import { useQuery } from '@apollo/client/react';
import { GroupId } from '@/entity/planner/groups';
import { Override } from '@/shared/lib';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import {
  GetPlannerInitDocument,
  GetPlannerInitQuery,
  GetPlannerInitQueryVariables,
} from './schemas/init.schema.generated';

type InitQuery = Override<
  GetPlannerInitQuery,
  {
    getPlannerInit: Override<GetPlannerInitQuery['getPlannerInit'], { inboxId: GroupId }>;
  }
>;

function usePlannerInit() {
  const result = useQuery<InitQuery, GetPlannerInitQueryVariables>(GetPlannerInitDocument, {
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
        id: result.data?.getPlannerInit.inboxId,
        taskCount: result.data?.getPlannerInit.inboxTaskCount,
      },
    },
    ...useExtendApolloErrorResult(result.error),
  };
}

export { usePlannerInit };
