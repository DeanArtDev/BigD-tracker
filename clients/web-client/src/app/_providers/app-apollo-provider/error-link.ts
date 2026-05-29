import { ErrorLink } from '@apollo/client/link/error';
import { from, switchMap, throwError } from 'rxjs';
import { report } from '@/feature/error-reactor';
import {
  fetchRefreshToken,
  fromApolloError,
  isRequestTimeout,
  isUnauthorized,
  RefreshTokenResponse,
} from '@/shared/transport/graphql';

let awaiter: Promise<RefreshTokenResponse> | null = null;

function refresh(): Promise<RefreshTokenResponse> {
  if (awaiter != null) return awaiter;

  awaiter = (async () => {
    try {
      const { data } = await fetchRefreshToken();
      return data;
    } finally {
      awaiter = null;
    }
  })();

  return awaiter;
}

const reactorErrorLink = new ErrorLink(({ error, operation, forward }) => {
  const unauthError = isUnauthorized(error);
  if (unauthError != null) {
    return from(refresh()).pipe(
      switchMap(({ data, errors }) => {
        if (data != null) return forward(operation);
        if (errors != null) report(unauthError);
        return throwError(() => unauthError);
      }),
    );
  }

  const [apiError] = fromApolloError(error);
  if (apiError != null) {
    if (isRequestTimeout(apiError) != null) report(apiError);
    return throwError(() => apiError);
  }
});

export { reactorErrorLink };
