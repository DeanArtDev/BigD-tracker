import { PUB_SUB } from '@/infrastructure/pubsub';
import { AUTH_RMQ_SERVICE, AppRmqClient } from '@/infrastructure/rmq-clients';
import { Public } from '@/modules/auth/decorators';
import { ExceptionUnauthorized } from '@/modules/auth/exceptions';
import { AuthGetMe } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Resolver, Query, ObjectType, ID, Field, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

@ObjectType()
export class MeRes {
  @Field(() => ID)
  id: number;

  @Field()
  email: string;
}

@Resolver()
export class UserResolver {
  constructor(
    @Inject(AUTH_RMQ_SERVICE) private readonly authClient: AppRmqClient,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {
    setInterval(() => {
      this.pubSub.publish('tick', { tick: Date.now() });
    }, 1000);
  }

  @Public()
  @Subscription(() => Number)
  tick() {
    return this.pubSub.asyncIterableIterator('tick');
  }

  @Public()
  @Query(() => MeRes)
  async me(): Promise<AuthGetMe.Response['data']> {
    try {
      const { data } = await this.authClient.send<AuthGetMe.Response, AuthGetMe.Request>(AuthGetMe.pattern, {
        data: { id: 1 },
      });

      return data;
    } catch {
      throw new ExceptionUnauthorized({ message: 'Пользователь не авторизован' });
    }
  }
}
