'use client';

import { ApolloLink } from '@apollo/client';
import { ApolloClient, ApolloNextAppProvider, InMemoryCache } from '@apollo/client-integration-nextjs';
import { PropsWithChildren } from 'react';
import { cookieAccessLink, retryLink, createHttpLink } from '@/shared/transport/graphql';
import { reactorErrorLink } from './error-link';

function makeClient() {
  const httpLink = createHttpLink({
    headers: {
      'X-User-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([reactorErrorLink, retryLink, cookieAccessLink, httpLink]),
  });
}

function AppApolloProvider({ children }: PropsWithChildren) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}

export { AppApolloProvider };
