import { useSuspenseQuery } from '@apollo/client/react';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { GetSidebarInfoQueryDocument, GetSidebarInfoQueryQuery } from './schemas/planner-sidebar.queries.generated';

function useSidebarInfoQuerySuspense() {
  const result = useSuspenseQuery<GetSidebarInfoQueryQuery>(GetSidebarInfoQueryDocument, {
    context: { endpoint: 'private' },
  });

  return {
    ...result,
    data: {
      id: result.data.getInbox?.id,
      inboxCount: result.data.getInbox.taskCount,
    },
    ...useExtendApolloErrorResult(result.error),
  };
}

export { useSidebarInfoQuerySuspense };
