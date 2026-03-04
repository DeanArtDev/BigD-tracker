import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { Priority, RecurrenceVo, Weight } from './value-objects';
import { Task } from './tasks.aggregate';

interface PartlyFields {
  readonly id: number;
  readonly status: TaskStatus;
  readonly priority: Priority;
  readonly weight: Weight;
  readonly recurrence?: RecurrenceVo;
}

const startOfToday = () => DateVo.create(new Date(new Date().setHours(0, 0, 0, 0)));

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

  deadlineInThePast: (input: { taskId?: number; deadline?: DateVo }) => {
    const { deadline, taskId } = input;

    if (deadline != null && deadline.isBefore(startOfToday().value)) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `deadline:${deadline.value} can't be in the past`,
        field: 'deadline',
        taskId,
      });
    }
  },

  startDateInThePast: (input: { taskId?: number; start?: DateVo }) => {
    const { start, taskId } = input;

    if (start != null && start.isBefore(startOfToday().value)) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `startDate:${start.value} can't be in the past`,
        field: 'startDate',
        taskId,
      });
    }
  },

  datesIntersections: (input: { start?: DateVo; end?: DateVo }) => {
    const { start, end } = input;

    if (start != null && end != null) {
      if (start.equals(end) || start.isAfter(end.value)) {
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

    if (patch.recurrence != null && !currentState.recurrence?.equals(patch.recurrence)) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Field can't be updated at this status: ${currentState.status}`,
        field: 'recurrence',
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

function assertHasCancelReason(input: { status: TaskStatus; reason?: string }): void {
  if (input.status === TaskStatus.CANCELLED && input.reason == null) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `cancelReason must not be empty`,
      field: 'cancelReason',
    });
  }
}

function assertTaskReplace(input: { status: TaskStatus; endDate?: string }): void {
  const { status } = input;

  if ([TaskStatus.DELETED, TaskStatus.ARCHIVED, TaskStatus.OVERDUE, TaskStatus.COMPLETED].includes(status)) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be updated at current status: ${status}`,
      field: 'status',
    });
  }
}

type StartOptional = { taskId: number; startDate?: string | null };
type StartRequired = { taskId: number; startDate: string };
function assertStartDateIsRequired(input: StartOptional): asserts input is StartRequired {
  if (input.startDate == null) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Оверрайд не может быть применен к делу: ${input.taskId} с пустой датой начала`,
      field: 'startDate',
      taskId: input.taskId,
    });
  }
}

export { taskAsserts, assertHasCancelReason, assertTaskReplace, assertStartDateIsRequired };
