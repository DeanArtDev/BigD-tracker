import { describe, expect, it } from 'vitest';
import {
  BaseValueObject,
  DateVo,
  Email,
  ExceptionInvalidInvariant,
  MonthdaysVo,
  Name,
  Result,
  TimezoneVo,
  YearmonthsVo,
} from '../index';

describe('value-objects index', () => {
  it('exports value object constructors', () => {
    expect(BaseValueObject).toBeDefined();
    expect(DateVo).toBeDefined();
    expect(Email).toBeDefined();
    expect(ExceptionInvalidInvariant).toBeDefined();
    expect(MonthdaysVo).toBeDefined();
    expect(Name).toBeDefined();
    expect(Result).toBeDefined();
    expect(TimezoneVo).toBeDefined();
    expect(YearmonthsVo).toBeDefined();
  });
});
