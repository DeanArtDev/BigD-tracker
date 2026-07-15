import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import {
  UpdateGroupMutation,
  UpdateGroupDocument,
  UpdateGroupMutationVariables,
} from './schemas/groups.schema.generated';

function useGroupUpdate() {
  const [updateGroup, rest] = useMutation<UpdateGroupMutation, UpdateGroupMutationVariables>(UpdateGroupDocument, {
    context: {
      endpoint: 'private',
    },
  });

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return { updateGroup, ...rest };
}

export { useGroupUpdate };
