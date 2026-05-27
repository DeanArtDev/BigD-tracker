import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Request } from 'express';
import { AccessTokenPayload } from '../dto/access-token.dto';
import { ExceptionAuthInvalidToken } from '../exceptions';
import { ACCESS_TOKEN_KEY } from '../constants';
import { GqlExecutionContext } from '@nestjs/graphql';

const getAccessToken = (req: Request): string | undefined => req.cookies[ACCESS_TOKEN_KEY];

const TokenPayload = createParamDecorator((_data, ctx: ExecutionContext) => {
  /*TODO: FIXME: delete when all endpoints will use apollo client */
  const req =
    ctx.switchToHttp().getRequest<Request>() ?? GqlExecutionContext.create(ctx).getContext<AppGraphQLContext>().request;
  const accessToken = req[ACCESS_TOKEN_KEY];

  const payload = plainToInstance(AccessTokenPayload, accessToken, {
    excludeExtraneousValues: true,
  });

  if (validateSync(payload).length > 0) {
    throw new ExceptionAuthInvalidToken({ message: 'Invalid token', subjectId: payload?.sid ?? payload?.uid });
  }

  return payload;
});

export { TokenPayload, getAccessToken };
