import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { GroupStatus } from '@big-d/api-contracts';

function assertGroupUpdate(input: { status: GroupStatus; endDate?: string }): void {
  const { status } = input;

  if ([GroupStatus.DONE].includes(status)) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Group can't be updated at current status: ${status}`,
      field: 'status',
    });
  }
}

export { assertGroupUpdate };
