import { useSuspenseQuery } from '@apollo/client/react';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { GetSidebarInfoQueryDocument, GetSidebarInfoQueryQuery } from './schemas/planner-sidebar.queries.generated';

function useSidebarInfoQuerySuspense() {
  const result = useSuspenseQuery<GetSidebarInfoQueryQuery>(GetSidebarInfoQueryDocument, {
    context: { endpoint: 'private' },
    errorPolicy: 'ignore',
  });

  return {
    ...result,
    data: {
      inboxCount: result.data?.getInbox.taskCount,
    },
    ...useExtendApolloErrorResult(result.error),
  };
}

export { useSidebarInfoQuerySuspense };
