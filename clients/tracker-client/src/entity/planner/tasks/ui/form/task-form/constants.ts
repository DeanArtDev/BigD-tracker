import { TaskStatus } from '@/entity/planner/tasks';

function getFieldRuleTypeByStatus(status: TaskStatus): 'editable' | 'readonly' {
  switch (status) {
    case TaskStatus.NOT_STARTED:
    case TaskStatus.IN_PROGRESS:
      return 'editable';

    case TaskStatus.COMPLETED:
    case TaskStatus.OVERDUE:
    case TaskStatus.CANCELED:
    case TaskStatus.ARCHIVED:
    case TaskStatus.DELETED:
      return 'readonly';

    default:
      return null as never;
  }
}

export { getFieldRuleTypeByStatus };
