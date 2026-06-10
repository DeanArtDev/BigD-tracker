import { Request, Response } from 'express';

interface AppGraphQLContext<TParentArgs = unknown> {
  readonly request: Request;
  readonly response: Response;
  parentArgs?: TParentArgs;
}

export { AppGraphQLContext };
