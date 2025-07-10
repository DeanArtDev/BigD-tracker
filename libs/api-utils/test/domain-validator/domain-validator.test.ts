import { describe, it, expect } from 'vitest';
import { DomainValidationError } from '@big-d/api-contracts';
import { DomainValidator } from '../../src/domain-validator/domain-validator';

enum SampleEnum {
  A = 'A',
  B = 'B',
}

const validator = new DomainValidator('sample');

describe('DomainValidator', () => {
  it('validates enum values', () => {
    expect(() => validator.isEnum(SampleEnum.A, SampleEnum, 'field')).not.toThrow();
    expect(() => validator.isEnum('C' as any, SampleEnum, 'field')).toThrow(DomainValidationError);
  });

  it('validates ISO dates', () => {
    expect(() => validator.isDateISO('2024-01-01', 'date')).not.toThrow();
    expect(() => validator.isDateISO('bad', 'date')).toThrow(DomainValidationError);
  });

  it('validates urls', () => {
    expect(() => validator.isUrl('https://example.com', 'url')).not.toThrow();
    expect(() => validator.isUrl('not-url', 'url')).toThrow(DomainValidationError);
  });

  it('validates non empty strings', () => {
    expect(() => validator.isNotStringEmpty('a', 'str')).not.toThrow();
    expect(() => validator.isNotStringEmpty('  ', 'str')).toThrow(DomainValidationError);
  });

  it('validates integers', () => {
    expect(() => validator.isValidInt(2, 'int')).not.toThrow();
    expect(() => validator.isValidInt(-1, 'int')).toThrow(DomainValidationError);
  });

  it('validates id values', () => {
    expect(() => validator.isIdValId(1, 'id')).not.toThrow();
    expect(() => validator.isIdValId(0, 'id')).toThrow(DomainValidationError);
  });

  it('validates date after', () => {
    expect(() => validator.isDateAfter('2024-01-02', '2024-01-01', 'date')).not.toThrow();
    expect(() => validator.isDateAfter('2023-01-01', '2024-01-01', 'date')).toThrow(
      DomainValidationError,
    );
  });

  it('validates int greater than', () => {
    expect(() => validator.isIntGt(5, 2, 'int')).not.toThrow();
    expect(() => validator.isIntGt(1, 2, 'int')).toThrow(DomainValidationError);
  });

  it('validates int max', () => {
    expect(() => validator.isIntMax(1, 2, 'int')).not.toThrow();
    expect(() => validator.isIntMax(3, 2, 'int')).toThrow(DomainValidationError);
  });

  it('validates float max', () => {
    expect(() => validator.isFloatMax(1.1, 2, 'float')).not.toThrow();
    expect(() => validator.isFloatMax(3.1, 2, 'float')).toThrow(DomainValidationError);
  });

  it('validates numeric string', () => {
    expect(() => validator.isNumericString('42', 'num')).not.toThrow();
    expect(() => validator.isNumericString('abc', 'num')).not.toThrow();
  });

  it('validates not int float', () => {
    expect(() => validator.isNotIntFloat(5, 'int')).not.toThrow();
    expect(() => validator.isNotIntFloat(1.1, 'int')).toThrow(DomainValidationError);
  });

  it('validates email', () => {
    expect(() => validator.isEmail('test@example.com', 'email')).not.toThrow();
    expect(() => validator.isEmail('bad', 'email')).toThrow(DomainValidationError);
  });

  it('throwError always throws', () => {
    expect(() => validator.throwError('msg', 'field')).toThrow(DomainValidationError);
  });
});
