import { ExceptionUnauthorized } from './exceptions';
import { Exception } from './exception-map';
import { ExceptionBody } from './lib/types';

const isException = (error: unknown): error is { code: number } => {
  return (
    typeof error === 'object' &&
    error != null &&
    'code' in error &&
    'key' in error &&
    'details' in error
  );
};

const isExceptionWrongLoginOrPasswordBody = (
  error: unknown,
): error is ExceptionBody<typeof Exception.WrongLoginOrPassword> => {
  return isException(error) ? error.code === Exception.WrongLoginOrPassword.code : false;
};

const isExceptionUnauthorized = (error: unknown): error is ExceptionUnauthorized => {
  return isException(error) ? error.code === Exception.Unauthorized.code : false;
};
//
// function generateTypeGuards(list: typeof Exception) {
//   return Object.entries(list).reduce((acc, [name, value]) => {
//     return {
//       ...acc,
//       [`is${name}`]: (error: unknown): error is typeof exception => {
//         return isException(error) ? error.code === exception. : false;
//       },
//     };
//   }, {});
// }

export { isExceptionUnauthorized, isExceptionWrongLoginOrPasswordBody };
