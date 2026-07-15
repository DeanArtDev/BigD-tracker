import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import {
  DeleteGroupDocument,
  DeleteGroupMutationVariables,
  DeleteGroupMutation,
} from './schemas/groups.schema.generated';

function useGroupDelete() {
  const [deleteGroup, rest] = useMutation<DeleteGroupMutation, DeleteGroupMutationVariables>(DeleteGroupDocument, {
    context: {
      endpoint: 'private',
    },
  });

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return { deleteGroup, ...rest };
}

export { useGroupDelete };
