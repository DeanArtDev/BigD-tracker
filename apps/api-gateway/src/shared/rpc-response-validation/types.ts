import { ValidationError } from 'class-validator';

type RpcResponseErrorFactory = (params: { issues: ValidationError[]; message?: string }) => Error;

export { RpcResponseErrorFactory };
