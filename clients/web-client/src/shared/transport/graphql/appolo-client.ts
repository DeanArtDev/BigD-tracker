import { HttpLink } from '@apollo/client';
import { registerApolloClient, ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import { getEnvConfigClient } from '@/shared/lib';

const clientConfig = getEnvConfigClient();

const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: clientConfig.NEXT_PUBLIC_API_URL,
    }),
  });
});

export { getClient, query, PreloadQuery };
