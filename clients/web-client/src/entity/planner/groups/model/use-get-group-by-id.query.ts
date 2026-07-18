import { useQuery } from '@apollo/client/react';
import { Override } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { GroupId } from './domain';
import { GetGroupByIdDocument, GetGroupByIdQuery, GetGroupByIdQueryVariables } from './schemas/groups.schema.generated';

type GroupById = Override<GetGroupByIdQuery['getGroup'], { id: GroupId }>;

type Query = Override<
  GetGroupByIdQuery,
  {
    getGroup: GroupById;
  }
>;

function useGetGroupById({ groupId }: { groupId?: number }) {
  const result = useQuery<Query, GetGroupByIdQueryVariables>(GetGroupByIdDocument, {
    context: { endpoint: 'private' },
    variables: { input: { groupId: groupId! } },
    skip: groupId == null,
  });

  const initialLoading = result.networkStatus === 1 && result.data == null;

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return {
    ...result,
    isError,
    initialLoading,
    isEmpty: !initialLoading && !result.loading && result.data?.getGroup == null,
    groupById: result.data?.getGroup,
  };
}

export { useGetGroupById, type GroupById };
