import { AppRmqClient, AUTH_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { AuthGetMe } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Field, ID, ObjectType, Query, Resolver } from '@nestjs/graphql';

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
  constructor(@Inject(AUTH_RMQ_SERVICE) private readonly authClient: AppRmqClient) {}

  @Query(() => MeRes)
  async me(@TokenPayload() accessTokenPayload: AccessTokenPayload): Promise<AuthGetMe.Response['data']> {
    const { data } = await this.authClient.send<AuthGetMe.Response, AuthGetMe.Request>(AuthGetMe.pattern, {
      data: { id: accessTokenPayload?.uid },
    });

    return data;
  }
}
