import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';

const PAYLOAD_KEY = 'tokenPayload';

const TokenPayload = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AccessTokenPayload | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const payload = plainToInstance(AccessTokenPayload, request[PAYLOAD_KEY], {
      excludeExtraneousValues: true,
    });

    if (validateSync(payload).length > 0) {
      return undefined;
    }
    return payload;
  },
);

export { TokenPayload, PAYLOAD_KEY };
