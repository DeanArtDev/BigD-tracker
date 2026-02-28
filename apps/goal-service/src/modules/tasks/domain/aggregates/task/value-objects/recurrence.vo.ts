import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { RecurrenceFrequency } from '@big-d/api-contracts';
import { BaseValueObject, DateVo } from '@big-d/api-utils';
import { isEqual } from 'lodash';

interface RecurrenceVoState {
  readonly startDate?: DateVo;
  readonly deadline?: DateVo;
  readonly frequency?: RecurrenceFrequency;
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
    const { deadline, startDate } = state;

    if (startDate != null && deadline != null) {
      if (startDate.equals(deadline) || startDate.isAfter(deadline.value)) {
        throw new ExceptionTaskDomainInvalidInvariant({
          message: `startDate:${startDate.value} must not be after or equal to deadline:${deadline.value}`,
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
