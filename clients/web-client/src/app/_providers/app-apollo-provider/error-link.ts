import { CombinedGraphQLErrors, ServerParseError } from '@apollo/client';
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
  // GraphQL-ошибки (errors[] в теле ответа от резолверов NestJS)
  if (CombinedGraphQLErrors.is(error)) {
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

    if (isRequestTimeout(error)) {
      const e = fromApolloError(error).find(Boolean);
      if (e != null) report(e);
      return;
    }
  }

  // BFF ОТВЕТИЛ, но не-2xx: есть error.statusCode (500/502/503) и error.bodyText
  // напр. reverse-proxy жив, а Nest-приложение упало → 502
  if (ServerParseError.is(error)) {
    return;
  }

  // BFF недоступен целиком / сеть легла / connection refused / DNS.
  // Это сырой TypeError, statusCode НЕТ.
  if (error.message === 'Failed to fetch') {
    return;
  }
});

export { reactorErrorLink };
