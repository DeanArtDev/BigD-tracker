import { TaskStatus } from '@/shared/transport/graphql';

type TaskFieldStatus = 'editable' | 'readonly';

function getTaskFieldsToChangeByStatus(status: TaskStatus): {
  name: TaskFieldStatus;
  description: TaskFieldStatus;
  recurrence: TaskFieldStatus;
  startDate: TaskFieldStatus;
  deadline: TaskFieldStatus;
  reason: TaskFieldStatus;
  priority: TaskFieldStatus;
} {
  switch (status) {
    case TaskStatus.NotStarted:
    case TaskStatus.InProgress:
      return {
        name: 'editable',
        description: 'editable',
        recurrence: 'editable',
        startDate: 'editable',
        deadline: 'editable',
        reason: 'editable',
        priority: 'editable',
      };

    case TaskStatus.Completed:
    case TaskStatus.Overdue:
    case TaskStatus.Canceled:
      return {
        name: 'editable',
        description: 'editable',
        reason: 'editable',
        recurrence: 'readonly',
        startDate: 'readonly',
        deadline: 'readonly',
        priority: 'readonly',
      };

    case TaskStatus.Archived:
    case TaskStatus.Deleted:
      return {
        name: 'readonly',
        description: 'readonly',
        recurrence: 'readonly',
        startDate: 'readonly',
        deadline: 'readonly',
        reason: 'readonly',
        priority: 'readonly',
      };

    default:
      return null as never;
  }
}

export { getTaskFieldsToChangeByStatus, type TaskFieldStatus };
