import { GetInboxQueryVariables } from './schemas/inbox.schema.generated';

const inboxInitialRequestVariables: {
  limit: NonNullable<GetInboxQueryVariables['input']>['limit'];
  cursor: NonNullable<GetInboxQueryVariables['input']>['cursor'];
} = {
  limit: 12,
  cursor: null,
};
export { inboxInitialRequestVariables };
