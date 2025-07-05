import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

class BaseRpcException<
  TDetails extends Record<string, any> = { message: string },
  TKey extends string = string,
  TCode extends number = number,
  TStatus extends HttpStatus = HttpStatus,
> extends RpcException {
  public key: TKey;
  public code: TCode;
  public status: TStatus;
  public details: TDetails;

  public constructor(data: {
    readonly key: TKey;
    readonly code: TCode;
    readonly status: TStatus;
    readonly details: TDetails;
  }) {
    super(data);
  }
}

export { BaseRpcException };
