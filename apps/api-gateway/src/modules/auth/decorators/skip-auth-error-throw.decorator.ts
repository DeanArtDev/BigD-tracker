import { SetMetadata } from '@nestjs/common';

const IS_AUTH_ERROR_THROW_SKIP = Symbol.for('is_auth_error_throw_skip');
const AuthErrorSkip = (value: boolean = true) => SetMetadata(IS_AUTH_ERROR_THROW_SKIP, value);

export { IS_AUTH_ERROR_THROW_SKIP, AuthErrorSkip };
