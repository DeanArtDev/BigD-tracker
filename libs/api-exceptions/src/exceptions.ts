import { Exception } from './exception-map';
import { ApiException } from './lib/exception';

const { WrongLoginOrPassword } = Exception;

class ExceptionWrongLoginOrPassword extends ApiException<
  typeof WrongLoginOrPassword.details,
  typeof WrongLoginOrPassword.key,
  typeof WrongLoginOrPassword.code,
  typeof WrongLoginOrPassword.status
> {
  static restore(data: typeof WrongLoginOrPassword.details) {
    return new ExceptionWrongLoginOrPassword(data);
  }

  constructor(details: typeof WrongLoginOrPassword.details) {
    super({
      key: WrongLoginOrPassword.key,
      code: WrongLoginOrPassword.code,
      status: WrongLoginOrPassword.status,
      details,
    });
  }
}

class ExceptionUnauthorized extends ApiException<typeof Exception.Unauthorized.details> {
  constructor(details: typeof Exception.Unauthorized.details = Exception.Unauthorized.details) {
    super({
      key: Exception.Unauthorized.key,
      code: Exception.Unauthorized.code,
      status: Exception.Unauthorized.status,
      details,
    });
  }
}

export { ExceptionWrongLoginOrPassword, ExceptionUnauthorized };
