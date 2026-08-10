import { gql } from '@apollo/client';

const TASK_FRAGMENT = gql`
  fragment TaskFragment on TaskSchema {
    id
    name
    description
    priority
    status

    groupId

    deadline
    startDate
    endDate

    cancelReason

    recurrence {
      frequency
      weekdays
      monthdays
      untilDate
      startDate
    }
  }
`;

export { TASK_FRAGMENT };
