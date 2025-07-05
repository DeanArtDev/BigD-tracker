import { HttpStatus } from '@nestjs/common';

export type ExceptionBody<
  TData extends {
    key: string;
    code: number;
    details: any;
    status: HttpStatus;
  },
> = Omit<
  DefineApiException<TData['key'], TData['code'], TData['status'], TData['details']>,
  'status'
>;

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
