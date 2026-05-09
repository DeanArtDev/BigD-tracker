'use client';

import { ApolloLink, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloNextAppProvider, ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import { createClient } from 'graphql-ws';
import { PropsWithChildren } from 'react';
import { getEnvConfigClient } from '@/shared/lib';

const clientConfig = getEnvConfigClient();

function makeClient() {
  const httpLink = new HttpLink({
    uri: clientConfig.NEXT_PUBLIC_API_URL,
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: clientConfig.NEXT_PUBLIC_WS_URL,
    }),
  );

  /* client uses mostly WS, server only HTTP */
  const link = ApolloLink.split(
    ({ query }) => getMainDefinition(query).kind === 'OperationDefinition',
    wsLink,
    httpLink,
  );

  return new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });
}

function ApolloProvider({ children }: PropsWithChildren) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}

export { ApolloProvider };
