import { RecurrenceVo } from '@/modules/tasks/domain';
import { RecurrenceFrequency } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { RRule, rrulestr } from 'rrule';

const rawRecurrenceToVo = (raw: {
  recurrence: string | null | undefined;
  deadline: string | Date | null | undefined;
  startDate: string | Date | null | undefined;
}): RecurrenceVo => {
  return RecurrenceVo.restore({
    frequency: raw.recurrence != null ? rrulestr(raw.recurrence)?.options.freq : undefined,
    deadline:
      raw.deadline != null ? DateVo.restore(new Date(raw.deadline).toISOString()) : undefined,
    startDate:
      raw.startDate != null ? DateVo.restore(new Date(raw.startDate).toISOString()) : undefined,
  });
};

interface RecurrenceVoToStringInput {
  readonly frequency: RecurrenceFrequency;
  readonly startDate: string;
  readonly deadline: string;
}

const recurrenceVoToString = (input: RecurrenceVoToStringInput): string => {
  return new RRule({
    freq: input.frequency,
    dtstart: new Date(input.startDate),
    until: new Date(input.deadline),
  }).toString();
};

export { rawRecurrenceToVo, recurrenceVoToString };
