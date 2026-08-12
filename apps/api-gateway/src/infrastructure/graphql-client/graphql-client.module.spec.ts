import { GRAPHQL_FIELD_RESOLVER_ENHANCERS } from './graphql-client.module';

describe('GraphQLClientModule', () => {
  it('enables interceptors for field resolvers', () => {
    expect(GRAPHQL_FIELD_RESOLVER_ENHANCERS).toContain('interceptors');
  });
});
