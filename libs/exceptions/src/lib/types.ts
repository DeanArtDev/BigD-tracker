import { HttpStatus } from '@nestjs/common';

export type DefineApiException<
  TKey extends string,
  TCode extends number,
  TStatus extends HttpStatus,
  TDetails extends Record<string, any> | undefined = Record<string, any>,
> = {
  readonly key: TKey;
  readonly code: TCode;
  readonly status: TStatus;
  readonly details: TDetails;
};
