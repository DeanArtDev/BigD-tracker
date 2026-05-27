import { Request, Response } from 'express';

interface AppGraphQLContext {
  readonly request: Request;
  readonly response: Response;
}

export { AppGraphQLContext };
