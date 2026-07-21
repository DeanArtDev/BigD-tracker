import { isFiniteNumeric } from '@/shared/lib/vlidation';

type TaskIdParserRes =
  | {
      readonly virtual?: never;
      readonly override?: never;
      readonly origin: { id: number };
    }
  | {
      readonly origin?: never;
      readonly override?: never;
      readonly virtual: { recurrenceId: number; date: string };
    }
  | {
      readonly origin?: never;
      readonly virtual?: never;
      readonly override: { recurrenceId: number; overrideId: number; date: string };
    };

class TaskIdParser {
  static #pattern = { virtual: 'v', origin: 'o', override: 'ov', divider: '::' };

  static unwrapId = (strId: string): TaskIdParserRes | undefined => {
    const pattern = TaskIdParser.#pattern;
    const [patn, id, date, overrideId] = strId.split(pattern.divider);

    if (pattern.override === patn && isFiniteNumeric(id) && isFiniteNumeric(overrideId) && date != null) {
      return { override: { recurrenceId: +id, date, overrideId: +overrideId } };
    }

    if (pattern.virtual === patn && isFiniteNumeric(id) && date != null) {
      return { virtual: { recurrenceId: +id, date } };
    }

    if (pattern.origin === patn && isFiniteNumeric(id)) {
      return { origin: { id: +id } };
    }

    return undefined;
  };
}

export { type TaskIdParserRes, TaskIdParser };
