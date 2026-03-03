import { RecurrenceVo } from '@/modules/tasks/domain';
import { RecurrenceFrequency, TaskRecurrenceWeekday } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { RRule, rrulestr } from 'rrule';

const rawRecurrenceToVo = (recurrence: string | null | undefined): RecurrenceVo | undefined => {
  const options = recurrence != null ? rrulestr(recurrence)?.options : undefined;

  if (options?.freq == null || options?.dtstart == null) {
    return undefined;
  }

  return RecurrenceVo.restore({
    weekdays: options.byweekday ?? undefined,
    frequency: options.freq ?? undefined,
    end: options.until != null ? DateVo.restore(options.until.toISOString()) : undefined,
    start: DateVo.restore(options.dtstart.toISOString()),
  });
};

interface RecurrenceVoToStringInput {
  readonly start: string;
  readonly end?: string;
  readonly frequency?: RecurrenceFrequency;
  readonly weekdays?: TaskRecurrenceWeekday[];
}

const recurrenceVoToString = (input: RecurrenceVoToStringInput): string => {
  return new RRule({
    freq: input.frequency,
    byweekday: input.weekdays,
    dtstart: new Date(input.start),
    until: input.end != null ? new Date(input.end) : undefined,
  }).toString();
};

export { rawRecurrenceToVo, recurrenceVoToString };
