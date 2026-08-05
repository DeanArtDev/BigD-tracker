import { ExceptionInternalGateway } from '@/modules/auth/exceptions';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';
import { AppGraphQLContext } from './types';

const GRAPHQL_PATH = '/graphql';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ApolloDriverConfig => {
        const IS_PROD_STAGE = config.get<boolean>('IS_PROD_STAGE');

        return {
          fieldResolverEnhancers: ['filters'],
          autoSchemaFile: join(process.cwd(), './src/infrastructure/graphql/schema.gql'),
          sortSchema: true,
          playground: false,
          path: GRAPHQL_PATH,
          introspection: !IS_PROD_STAGE,
          plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
          context: (ctx): AppGraphQLContext => {
            const { req, res } = ctx;
            if (req == null || res == null) {
              throw new ExceptionInternalGateway({ message: 'GraphQLModule lost res or req' });
            }
            return { request: req, response: res, loaders: new Map() };
          },
          formatError: (formatted) => {
            const IS_PROD_STAGE = config.get<boolean>('IS_PROD_STAGE');

            const details = IS_PROD_STAGE
              ? undefined
              : formatted?.extensions != null && 'stacktrace' in formatted.extensions
                ? {
                    stacktrace: formatted.extensions?.stacktrace,
                  }
                : {};

            return {
              message: formatted.message,
              path: formatted.path,
              locations: IS_PROD_STAGE ? undefined : formatted.locations,
              extensions: { ...formatted.extensions, ...details },
            };
          },
        };
      },
    }),
  ],
})
export class GraphQLClientModule {}

export { GRAPHQL_PATH };
