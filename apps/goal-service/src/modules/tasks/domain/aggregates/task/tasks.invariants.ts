import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { Task } from './tasks.aggregate';
import { Priority, Weight } from './value-objects';

interface PartlyFields {
  readonly id: number;
  readonly status: TaskStatus;
  readonly priority: Priority;
  readonly weight: Weight;
}

const taskAsserts = {
  endDateNotInThePast: (input: { end?: DateVo }) => {
    const { end } = input;

    if (end != null && end.isBefore(new Date().toISOString())) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `end:${end.value} can't be in the past`,
        field: 'end',
      });
    }
  },

  datesIntersections: (input: { start?: DateVo; end?: DateVo }) => {
    const { start, end } = input;

    if (start != null && end != null) {
      if (start.equals(end) || start.isAfter(end)) {
        throw new ExceptionTaskDomainInvalidInvariant({
          message: `startDate:${start.value} must not be after or equal to endDate: ${end.value}`,
          field: 'startDate',
        });
      }
    }
  },

  partlyReplaceableFields(currentState: PartlyFields, patch: Omit<PartlyFields, 'id' | 'status'>) {
    if (patch.priority != null && !currentState.priority?.equals(patch.priority)) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Field can't be updated at this status: ${currentState.status}`,
        field: 'priority',
        taskId: currentState.id,
      });
    }

    if (patch.weight != null && !currentState.weight?.equals(patch.weight)) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Field can't be updated at this status: ${currentState.status}`,
        field: 'weight',
        taskId: currentState.id,
      });
    }
  },

  neededRecurrenceFields: (input: { start?: DateVo; deadline?: DateVo }) => {
    const { start, deadline } = input;
    if (start == null || deadline == null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Дело должно иметь дату начала и дедлайн для задания повторяемости`,
        field: 'recurrence',
      });
    }
  },

  notDraft(input: Task) {
    if (input.isDraft) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Оверрайд не может быть применен к черновому делу`,
        field: 'startDate',
        taskId: input.id,
      });
    }
  },
};

function assertTaskReplace(input: { status: TaskStatus; endDate?: string }): void {
  const { status } = input;

  if ([TaskStatus.DELETED, TaskStatus.ARCHIVED, TaskStatus.OVERDUE, TaskStatus.COMPLETED].includes(status)) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be updated at current status: ${status}`,
      field: 'status',
    });
  }
}

type DatesOptional = { taskId: number; startDate?: string | null; deadline?: string | null };
type DatesRequired = { taskId: number; startDate: string; deadline: string };
function assertStartDateAndDeadlineAreRequired(input: DatesOptional): asserts input is DatesRequired {
  if (input.startDate == null) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Оверрайд не может быть применен к делу: ${input.taskId} с пустой датой начала`,
      field: 'startDate',
      taskId: input.taskId,
    });
  }

  if (input.deadline == null) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Оверрайд не может быть применен к делу: ${input.taskId} с пустым дедлайном`,
      field: 'deadline',
      taskId: input.taskId,
    });
  }
}

export { taskAsserts, assertTaskReplace, assertStartDateAndDeadlineAreRequired };
