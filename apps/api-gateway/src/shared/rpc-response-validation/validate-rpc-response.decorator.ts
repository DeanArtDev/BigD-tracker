import { SetMetadata } from '@nestjs/common';

const RPC_RESPONSE_SCHEMA = Symbol('RPC_RESPONSE_SCHEMA');

const ValidateRpcResponse = (schema: any) => SetMetadata(RPC_RESPONSE_SCHEMA, schema);

export { ValidateRpcResponse, RPC_RESPONSE_SCHEMA };
