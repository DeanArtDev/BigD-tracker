import { describe, it, expectTypeOf } from 'vitest';
import type {
  Override,
  ValueOf,
  Nullable,
  Undefinedable,
  OmitCreateFields,
  ReturnHandlerType,
  HasId,
} from '../src/type-helpers';

interface Entity {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

class Handler {
  async execute(): Promise<number> {
    return 1;
  }
}

describe('type-helpers', () => {
  it('Override replaces field type', () => {
    type Result = Override<Entity, 'name', number>;
    expectTypeOf<Result>().toEqualTypeOf<{
      id: number;
      name: number;
      created_at: string;
      updated_at: string;
    }>();
  });

  it('ValueOf resolves union of values', () => {
    type T = ValueOf<{ a: 1; b: 'b' }>;
    expectTypeOf<T>().toEqualTypeOf<1 | 'b'>();
  });

  it('Nullable makes fields nullable', () => {
    type T = Nullable<{ a: number }>;
    expectTypeOf<T>().toEqualTypeOf<{ a: number | null }>();
  });

  it('Undefinedable makes fields optional', () => {
    type T = Undefinedable<{ a: number }>;
    expectTypeOf<T>().toEqualTypeOf<{ a?: number | undefined }>();
  });

  it('OmitCreateFields removes default fields', () => {
    type T = OmitCreateFields<Entity>;
    expectTypeOf<T>().toEqualTypeOf<{ name: string }>();
  });

  it('ReturnHandlerType infers execute return type', () => {
    type T = ReturnHandlerType<typeof Handler>;
    expectTypeOf<T>().toEqualTypeOf<Promise<number>>();
  });

  it('HasId interface shape', () => {
    const obj: HasId = { id: 1 };
    expectTypeOf(obj.id).toEqualTypeOf<number | string>();
  });
});
