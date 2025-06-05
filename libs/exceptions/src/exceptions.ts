import { Exception } from './exception-map';
import { ApiException } from './lib/exception';

class ExceptionWrongLoginOrPassword extends ApiException<
  typeof Exception.WrongLoginOrPassword.details
> {
  constructor(details: typeof Exception.WrongLoginOrPassword.details) {
    super({
      key: Exception.WrongLoginOrPassword.key,
      code: Exception.WrongLoginOrPassword.code,
      status: Exception.WrongLoginOrPassword.status,
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
