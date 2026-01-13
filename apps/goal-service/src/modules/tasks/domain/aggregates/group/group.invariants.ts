import { ExceptionDomainInvalidInvariant } from '@/modules/tasks/domain/errors';
import { GroupStatus } from '@big-d/api-contracts';

function assertGroupUpdate(input: { status: GroupStatus; endDate?: string }): void {
  const { status } = input;

  if ([GroupStatus.DONE].includes(status)) {
    throw new ExceptionDomainInvalidInvariant({
      message: `Group can't be updated at current status: ${status}`,
      field: 'status',
    });
  }
}

export { assertGroupUpdate };
