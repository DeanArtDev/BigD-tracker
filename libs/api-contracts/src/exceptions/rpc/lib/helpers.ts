import { HttpStatus } from '@nestjs/common';
import { DefineApiException } from './types';

const Details = {
  Any: {} as Record<string, any>,
  Optional: undefined,

  Define: <TType extends Record<string, any>>(): TType => ({}) as TType,
};

function defineRpcException<
  TKey extends string,
  TCode extends number,
  TStatus extends HttpStatus,
  TDetails extends Record<string, any> = { message: string },
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

export { Details, defineRpcException };
