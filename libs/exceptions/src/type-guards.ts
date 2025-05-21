import { ExceptionUnauthorized, ExceptionWrongLoginOrPassword } from './exceptions';
import { Exception } from './exception-map';

const isException = (error: unknown): error is { code: number } => {
  return typeof error === 'object' && error != null && 'code' in error;
};

const isExceptionWrongLoginOrPassword = (
  error: unknown,
): error is ExceptionWrongLoginOrPassword => {
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

export { isExceptionUnauthorized, isExceptionWrongLoginOrPassword };
