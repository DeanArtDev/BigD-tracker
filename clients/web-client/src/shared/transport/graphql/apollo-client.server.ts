import { ApolloLink } from '@apollo/client';
import { ApolloClient, InMemoryCache, registerApolloClient } from '@apollo/client-integration-nextjs';
import { headers } from 'next/headers';
import { cookieAccessLink, createHttpLink, errorLink } from '@/shared/transport/graphql/links';

async function getServerOrigin() {
  const headersList = await headers();

  const host = headersList.get('host');

  if (!host) {
    throw new Error('Missing host header');
  }

  const proto = headersList.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');

  return `${proto}://${host}`;
}

async function getGraphqlUri() {
  if (typeof window !== 'undefined') {
    return '/api/graphql';
  }

  const origin = await getServerOrigin();

  return `${origin}/api/graphql`;
}

const { getClient, query, PreloadQuery } = registerApolloClient(async () => {
  const h = await headers();

  const httpLink = createHttpLink({ uri: await getGraphqlUri(), headers: Object.fromEntries(h) });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([errorLink, cookieAccessLink, httpLink]),
  });
});

export { getClient, query, PreloadQuery };
