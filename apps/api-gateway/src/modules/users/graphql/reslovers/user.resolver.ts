import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { AppRmqClient, AUTH_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { AuthGetMe, isBaseRpcException, unwrapDefaultRpcException } from '@big-d/api-contracts';
import { exceptionCode } from '@big-d/exceptions';
import { Inject } from '@nestjs/common';
import { Context, Field, ID, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { CookieService } from '@shared/services/cookies';

@ObjectType()
export class MeRes {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  screenName?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;
}

@Resolver()
export class UserResolver {
  constructor(
    private readonly cookieService: CookieService,
    @Inject(AUTH_RMQ_SERVICE) private readonly authClient: AppRmqClient,
  ) {}

  @Query(() => MeRes)
  async me(
    @TokenPayload() accessTokenPayload: AccessTokenPayload,
    @Context() ctx: AppGraphQLContext,
  ): Promise<AuthGetMe.Response['data']> {
    try {
      const { data } = await this.authClient.send<AuthGetMe.Response, AuthGetMe.Request>(AuthGetMe.pattern, {
        data: { id: accessTokenPayload?.uid },
      });
      return data;
    } catch (error) {
      const err = unwrapDefaultRpcException(error) ?? error;
      if (isBaseRpcException(err) && err.code === exceptionCode.userNotFound.code) {
        this.cookieService.dropTokens(ctx.response);
      }
      throw error;
    }
  }
}
