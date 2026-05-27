import { ApolloLink } from '@apollo/client';

const cookieAccessLink = new ApolloLink((operation, forward) => {
  const { endpoint } = operation.getContext();
  operation.setContext({ credentials: ['private', 'public-cookies-include'].includes(endpoint) ? 'include' : 'omit' });
  return forward(operation);
});

export { cookieAccessLink };
