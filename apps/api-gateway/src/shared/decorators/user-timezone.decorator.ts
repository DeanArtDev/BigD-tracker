import { USER_TIME_ZONE_HEADER_KEY } from '@big-d/api-utils';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const UserTimezone = createParamDecorator((_data, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  return req.headers[USER_TIME_ZONE_HEADER_KEY];
});

export { UserTimezone };
