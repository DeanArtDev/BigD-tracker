import { HttpStatus, HttpException } from '@nestjs/common';

export class ApiException<
  TDetails extends Record<string, any> | undefined = Record<string, any>,
  TKey extends string = string,
  TCode extends number = number,
  TStatus extends HttpStatus = HttpStatus,
> extends HttpException {
  public constructor(data: {
    readonly key: TKey;
    readonly code: TCode;
    readonly status: TStatus;
    readonly details: TDetails;
  }) {
    const { status, ...other } = data;
    super(other, status);
  }
}
