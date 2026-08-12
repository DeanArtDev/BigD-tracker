import { isGraphqlDocumentationRequest } from './connect-documentation';

describe('isGraphqlDocumentationRequest', () => {
  it('identifies the GraphQL landing page request', () => {
    expect(isGraphqlDocumentationRequest({ method: 'GET', query: {} })).toBe(true);
  });

  it('does not identify a GraphQL GET operation as documentation', () => {
    expect(isGraphqlDocumentationRequest({ method: 'GET', query: { query: '{ viewer { id } }' } })).toBe(false);
  });

  it('does not identify a GraphQL POST operation as documentation', () => {
    expect(isGraphqlDocumentationRequest({ method: 'POST', query: {} })).toBe(false);
  });
});
