import { ServerError } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';

const retryLink = new RetryLink({
  delay: {
    initial: 3000,
    max: 5000,
    jitter: true,
  },

  attempts: {
    max: 3,
    retryIf: (error) => {
      if (ServerError.is(error)) {
        return error.statusCode >= 500 || error.statusCode === 429;
      }

      return error != null;
    },
  },
});

export { retryLink };
