import { HttpStatus } from '@nestjs/common';
import { DefineApiException } from './types';

export const Details = {
  Empty: {} as Record<string, never>,
  Any: {} as Record<string, any>,
  Optional: undefined,

  Define: <TType extends Record<string, any>>(): TType => ({}) as TType,
};

export function defineApiException<
  TKey extends string,
  TCode extends number,
  TStatus extends HttpStatus,
  TDetails extends Record<string, any> | undefined = undefined,
>(
  key: TKey,
  code: TCode,
  status: TStatus,
  details: TDetails,
): DefineApiException<TKey, TCode, TStatus, TDetails> {
  return {
    key,
    code,
    status,
    details,
  };
}
