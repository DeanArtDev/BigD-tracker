'use client';

import { ApolloLink, FieldPolicy } from '@apollo/client';
import { FieldMergeFunctionOptions, FieldReadFunctionOptions } from '@apollo/client/cache';
import { ApolloClient, ApolloNextAppProvider, InMemoryCache } from '@apollo/client-integration-nextjs';
import { PropsWithChildren } from 'react';
import { GetInboxQuery, GetInboxQueryVariables } from '@/entity/planner/inbox';
import { TaskSchema } from '@/entity/schema-types';
import { cookieAccessLink, createHttpLink, retryLink } from '@/shared/transport/graphql';
import { reactorErrorLink } from './error-link';

const inboxTasksItemsPolicy: FieldPolicy<
  GetInboxQuery['getInbox']['tasks'],
  GetInboxQuery['getInbox']['tasks'],
  GetInboxQuery['getInbox']['tasks'],
  FieldReadFunctionOptions,
  FieldMergeFunctionOptions<object, GetInboxQueryVariables>
> = {
  keyArgs: ['input', ['search', 'status', 'priority']],

  merge(existing, incoming, { variables, readField }) {
    const existingItems = existing?.items ?? [];
    const incomingItems = incoming?.items ?? [];
    const seen = new Set(existingItems.map((item) => readField('id', item)));
    const items = [...existingItems, ...incomingItems.filter((item) => !seen.has(readField('id', item)))];

    const isInitialRequest = variables?.input?.cursor == null;
    const hasCache = existing?.items != null;

    return {
      ...incoming,
      items,
      meta: {
        ...incoming.meta,
        hasNextPage: isInitialRequest && hasCache ? existing.meta.hasNextPage : incoming.meta.hasNextPage,
        endCursor: isInitialRequest && hasCache ? existing.meta.endCursor : incoming.meta.endCursor,
      },
    };
  },
};

function makeClient() {
  const httpLink = createHttpLink({
    headers: {
      'X-User-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        TaskSchema: {
          keyFields: ['id'],
        },

        Query: {
          fields: {
            getTaskById: {
              read(_existing, { args, toReference }) {
                const id = args?.id;
                if (id == null) return undefined;
                const __typename: TaskSchema['__typename'] = 'TaskSchema';
                return toReference({ __typename, id });
              },
            },
          },
        },

        GetInboxResponse: {
          fields: {
            tasks: inboxTasksItemsPolicy,
          },
        },
      },
    }),
    link: ApolloLink.from([reactorErrorLink, retryLink, cookieAccessLink, httpLink]),
  });
}

function AppApolloProvider({ children }: PropsWithChildren) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}

export { AppApolloProvider };
