import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import {
  CreateGroupMutation,
  CreateGroupMutationVariables,
  CreateGroupDocument,
} from './schemas/groups.schema.generated';

function useGroupCreate() {
  const [createGroup, rest] = useMutation<CreateGroupMutation, CreateGroupMutationVariables>(CreateGroupDocument, {
    context: {
      endpoint: 'private',
    },
  });

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return { createGroup, ...rest };
}

export { useGroupCreate };
