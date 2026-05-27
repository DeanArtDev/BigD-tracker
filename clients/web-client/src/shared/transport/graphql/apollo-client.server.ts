import { ApolloLink } from '@apollo/client';
import { ApolloClient, InMemoryCache, registerApolloClient } from '@apollo/client-integration-nextjs';
import { headers } from 'next/headers';
import { cookieAccessLink, createHttpLink, errorLink } from '@/shared/transport/graphql/links';

const { getClient, query, PreloadQuery } = registerApolloClient(async () => {
  const h = await headers();

  const httpLink = createHttpLink({ headers: Object.fromEntries(h) });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([errorLink, cookieAccessLink, httpLink]),
  });
});

export { getClient, query, PreloadQuery };
