import { useSuspenseQuery } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { Query } from './types';
import { GetGroupByIdDocument, GetGroupByIdQueryVariables } from '../schemas/groups.schema.generated';

function useGetGroupByIdSuspense({ groupId }: { groupId: number }) {
  const result = useSuspenseQuery<Query, GetGroupByIdQueryVariables>(GetGroupByIdDocument, {
    context: { endpoint: 'private' },
    variables: { input: { groupId } },
    errorPolicy: 'ignore',
  });

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return {
    ...result,
    isError,
    isEmpty: result.data?.getGroup == null,
    groupById: result.data?.getGroup,
  };
}

export { useGetGroupByIdSuspense };
