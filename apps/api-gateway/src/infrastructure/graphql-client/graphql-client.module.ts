import { ExceptionInternalGateway } from '@/modules/auth/exceptions';
import type { APP_ENV } from '@/infrastructure/configs';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';
import { AppGraphQLContext } from './types';
import { formatGraphqlError } from './format-graphql-error';

const GRAPHQL_PATH = '/graphql';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<APP_ENV, true>): ApolloDriverConfig => {
        const IS_PROD_STAGE = config.get<boolean>('IS_PROD_STAGE');
        const appEnvironment = config.getOrThrow<APP_ENV['APP_ENV']>('APP_ENV');

        return {
          fieldResolverEnhancers: ['filters'],
          autoSchemaFile: join(process.cwd(), './src/infrastructure/graphql-client/schema.gql'),
          sortSchema: true,
          playground: false,
          path: GRAPHQL_PATH,
          introspection: !IS_PROD_STAGE,
          includeStacktraceInErrorResponses: appEnvironment === 'local',
          plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
          context: (ctx): AppGraphQLContext => {
            const { req, res } = ctx;
            if (req == null || res == null) {
              throw new ExceptionInternalGateway({ message: 'GraphQLModule lost res or req' });
            }
            return { request: req, response: res, loaders: new Map() };
          },
          formatError: (formatted) => formatGraphqlError(formatted, appEnvironment),
        };
      },
    }),
  ],
})
export class GraphQLClientModule {}

export { GRAPHQL_PATH };
