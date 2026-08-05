import { Request, Response } from 'express';

interface AppGraphQLContext {
  readonly request: Request;
  readonly response: Response;
  readonly loaders: Map<symbol, unknown>;
}

export { AppGraphQLContext };
