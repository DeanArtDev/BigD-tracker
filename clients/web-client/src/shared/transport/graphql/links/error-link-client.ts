import { CombinedGraphQLErrors, ServerParseError } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';

const errorLinkClient = new ErrorLink(({ error, operation }) => {
  // Public methods is ignored, error bubbling to hook initiator
  if (operation.getContext().endpoint === 'public') return;

  // GraphQL-ошибки (errors[] в теле ответа от резолверов NestJS)
  if (CombinedGraphQLErrors.is(error)) {
    return;
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

export { errorLinkClient };
