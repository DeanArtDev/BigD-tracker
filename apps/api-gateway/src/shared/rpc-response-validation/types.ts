import { ValidationError } from 'class-validator';

type RpcResponseErrorFactory = (params: { issues: ValidationError[] }) => Error;

export { RpcResponseErrorFactory };
