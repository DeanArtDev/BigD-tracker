import { isNumeric } from 'validator';

type UnwrapIdRes =
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

class TaskIdBuilder {
  static #pattern = { virtual: 'v', origin: 'o', override: 'ov', divider: '::' };

  constructor() {}

  static wrapVirtualId = (input: { recurrenceId: number; date: string }) => {
    const { recurrenceId, date } = input;
    const pattern = TaskIdBuilder.#pattern;
    return `${pattern.virtual}${pattern.divider}${recurrenceId}${pattern.divider}${date}`;
  };

  static wrapOverrideId = (input: { recurrenceId: number; overrideId: number; date: string }) => {
    const { recurrenceId, overrideId, date } = input;
    const pattern = TaskIdBuilder.#pattern;
    return `${pattern.override}${pattern.divider}${recurrenceId}${pattern.divider}${date}${pattern.divider}${overrideId}`;
  };

  static wrapOriginId = (id: number) => {
    const pattern = TaskIdBuilder.#pattern;
    return `${pattern.origin}${pattern.divider}${id}`;
  };

  static unwrapId = (strId: string): UnwrapIdRes | undefined => {
    const pattern = TaskIdBuilder.#pattern;
    const [patn, id, date, overrideId] = strId.split(pattern.divider);

    if (pattern.override === patn && isNumeric(id) && isNumeric(overrideId) && date != null) {
      return { override: { recurrenceId: +id, date, overrideId: +overrideId } };
    }

    if (pattern.virtual === patn && isNumeric(id) && date != null) {
      return { virtual: { recurrenceId: +id, date } };
    }

    if (pattern.origin === patn && isNumeric(id)) {
      return { origin: { id: +id } };
    }

    return undefined;
  };
}

export { UnwrapIdRes, TaskIdBuilder };
