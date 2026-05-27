type EndpointKind = 'public' | 'private' | 'public-cookies-include';

interface GraphQLRequestContext {
  readonly endpoint: EndpointKind;
}

export type { GraphQLRequestContext, EndpointKind };
