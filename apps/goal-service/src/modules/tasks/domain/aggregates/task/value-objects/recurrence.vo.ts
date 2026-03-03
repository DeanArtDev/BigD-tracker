import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { RecurrenceFrequency, TaskRecurrenceWeekday } from '@big-d/api-contracts';
import { BaseValueObject, DateVo } from '@big-d/api-utils';
import { isEqual } from 'lodash';

interface RecurrenceVoState {
  readonly start: DateVo;
  readonly end?: DateVo;
  readonly frequency?: RecurrenceFrequency;
  readonly weekdays?: TaskRecurrenceWeekday[];
}

class RecurrenceVo implements BaseValueObject {
  #state: RecurrenceVoState;

  private constructor(state: RecurrenceVoState) {
    this.#state = state;
  }

  get value(): RecurrenceVoState {
    return this.#state;
  }

  public static create(state: RecurrenceVoState): RecurrenceVo {
    const { end, start } = state;

    if (start != null && end != null) {
      if (start.equals(end) || start.isAfter(end.value)) {
        throw new ExceptionTaskDomainInvalidInvariant({
          message: `startDate:${start.value} must not be after or equal to deadline:${end.value}`,
          field: 'startDate',
        });
      }
    }

    return new RecurrenceVo(state);
  }

  public static restore(state: RecurrenceVoState): RecurrenceVo {
    return new RecurrenceVo(state);
  }

  public equals(other: RecurrenceVo): boolean {
    return isEqual(this.#state, other.value);
  }
}

export { RecurrenceVo };
