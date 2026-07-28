'use client';

import { ApolloLink, FieldPolicy } from '@apollo/client';
import { FieldMergeFunctionOptions, FieldReadFunctionOptions } from '@apollo/client/cache';
import { ApolloClient, ApolloNextAppProvider, InMemoryCache } from '@apollo/client-integration-nextjs';
import { PropsWithChildren } from 'react';
import {
  cookieAccessLink,
  createHttpLink,
  GetGroupListQuery,
  GetGroupListQueryVariables,
  GetInboxQuery,
  GetInboxQueryVariables,
  GetTasksCursorQuery,
  GetTasksCursorQueryVariables,
  GetTasksPerPageQuery,
  GetTasksPerPageQueryVariables,
  retryLink,
  TaskSchema,
} from '@/shared/transport/graphql';
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

const getGroupListPolicy: FieldPolicy<
  GetGroupListQuery['getGroupList'],
  GetGroupListQuery['getGroupList'],
  GetGroupListQuery['getGroupList'],
  FieldReadFunctionOptions,
  FieldMergeFunctionOptions<object, Partial<GetGroupListQueryVariables>>
> = {
  keyArgs: ['input', ['search']],

  merge(existing, incoming, options) {
    const { variables, readField } = options;

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

const getTasksCursorPolicy: FieldPolicy<
  GetTasksCursorQuery['getTasksCursor'],
  GetTasksCursorQuery['getTasksCursor'],
  GetTasksCursorQuery['getTasksCursor'],
  FieldReadFunctionOptions,
  FieldMergeFunctionOptions<object, Partial<GetTasksCursorQueryVariables>>
> = {
  keyArgs: ['input', ['search', 'status', 'priority', 'groupIds', 'ids']],

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

const getTasksPerPagePolicy: FieldPolicy<
  GetTasksPerPageQuery['getTasksPerPage'],
  GetTasksPerPageQuery['getTasksPerPage'],
  GetTasksPerPageQuery['getTasksPerPage'],
  FieldReadFunctionOptions,
  FieldMergeFunctionOptions<object, Partial<GetTasksPerPageQueryVariables>>
> = {
  keyArgs: ['input', ['search', 'status', 'priority', 'groupIds', 'ids', 'sort', 'recurring']],

  merge(existing, incoming, { variables, readField }) {
    const isInitialRequest = variables?.input?.page === 1;
    const existingItems = isInitialRequest ? [] : (existing?.items ?? []);
    const incomingItems = incoming?.items ?? [];
    const seen = new Set(existingItems.map((item) => readField('id', item)));
    const items = [...existingItems, ...incomingItems.filter((item) => !seen.has(readField('id', item)))];

    return {
      ...incoming,
      items,
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
            getGroupList: getGroupListPolicy,
            getTasksCursor: getTasksCursorPolicy,
            getTasksPerPage: getTasksPerPagePolicy,
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
