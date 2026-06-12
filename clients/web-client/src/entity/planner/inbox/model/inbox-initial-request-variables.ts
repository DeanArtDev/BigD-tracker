import { GetInboxQueryVariables } from './schemas/inbox.schema.generated';

const inboxInitialRequestVariables: {
  limit: NonNullable<GetInboxQueryVariables['input']>['limit'];
  cursor: NonNullable<GetInboxQueryVariables['input']>['cursor'];
} = {
  limit: 15,
  cursor: null,
};
export { inboxInitialRequestVariables };
