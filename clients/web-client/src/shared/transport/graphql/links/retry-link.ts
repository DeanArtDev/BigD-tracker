import { CombinedGraphQLErrors, ServerError } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { isRequestTimeout } from '@/shared/transport/graphql';

const retryLink = new RetryLink({
  delay: {
    initial: 3000,
    max: 5000,
    jitter: true,
  },

  attempts: {
    max: 3,
    retryIf: (error) => {
      if (CombinedGraphQLErrors.is(error)) {
        if (isRequestTimeout(error)) return true;
      }

      if (ServerError.is(error)) {
        return error.statusCode >= 500 || error.statusCode === 429;
      }

      return error != null;
    },
  },
});

export { retryLink };
