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
      readonly virtual: { masterTaskId: number; timestamp: number };
    }
  | {
      readonly origin?: never;
      readonly virtual?: never;
      readonly override: { masterTaskId: number; overrideId: number; timestamp: number };
    };

class TaskIdBuilder {
  static #pattern = { virtual: 'v', origin: 'o', override: 'ov', divider: ':' };

  constructor() {}

  static wrapVirtualId = (input: { masterTaskId: number; timestamp: number }) => {
    const { masterTaskId, timestamp } = input;
    const pattern = TaskIdBuilder.#pattern;
    return `${pattern.virtual}${pattern.divider}${masterTaskId}${pattern.divider}${timestamp}`;
  };

  static wrapOverrideId = (input: {
    masterTaskId: number;
    overrideId: number;
    timestamp: number;
  }) => {
    const { masterTaskId, overrideId, timestamp } = input;
    const pattern = TaskIdBuilder.#pattern;
    return `${pattern.override}${pattern.divider}${masterTaskId}${pattern.divider}${timestamp}${pattern.divider}${overrideId}`;
  };

  static wrapOriginId = (id: number) => {
    const pattern = TaskIdBuilder.#pattern;
    return `${pattern.origin}${pattern.divider}${id}`;
  };

  static unwrapId = (strId: string): UnwrapIdRes | undefined => {
    const pattern = TaskIdBuilder.#pattern;
    const [patn, id, timestamp, overrideId] = strId.split(pattern.divider);

    if (
      pattern.override === patn &&
      isNumeric(id) &&
      isNumeric(timestamp) &&
      isNumeric(overrideId)
    ) {
      return { override: { masterTaskId: +id, timestamp: +timestamp, overrideId: +overrideId } };
    }

    if (pattern.virtual === patn && isNumeric(id) && isNumeric(timestamp)) {
      return { virtual: { masterTaskId: +id, timestamp: +timestamp } };
    }

    if (pattern.origin === patn && isNumeric(id)) {
      return { origin: { id: +id } };
    }

    return undefined;
  };
}

export { UnwrapIdRes, TaskIdBuilder };
