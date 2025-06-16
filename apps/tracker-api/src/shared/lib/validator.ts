import { toFinite } from 'lodash-es';
import { isAfter, isInt, isURL, isFloat } from 'validator';
import isISO8601 from 'validator/lib/isISO8601';
import { DomainValidationError } from './errors';

class Validator {
  constructor(public readonly domain: string) {}

  isEnum<T extends object>(value: unknown, enumEntity: T, field: string) {
    const enumItems = Object.values(enumEntity);
    if (!enumItems.includes(value)) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: `${field}: must be a one of ${enumItems.join(', ')}`,
      });
    }
  }

  isDateISO(value: string, field: string): void {
    if (!isISO8601(value)) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: `${field}: must be a valid ISO 8601 date string`,
      });
    }
  }

  isUrl(value: string, field: string): void {
    if (!isURL(value)) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: 'must be a valid URL',
      });
    }
  }

  isNotStringEmpty(value: string, field: string): void {
    if (value.trim().length === 0) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: 'string must not be empty',
      });
    }
  }

  isIdValId(value: number, field: string) {
    if (!isFinite(value)) return;
    if (value <= 0 || Number.isNaN(value) || !isInt(value.toString())) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: `id must not be valid id:${value}`,
      });
    }
  }

  isDateAfter(str: string, date: string, field: string, message?: string) {
    if (!isAfter(str, date)) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: message ?? `${field}: ${str} must be before ${date}`,
      });
    }
  }

  isIntGt(value: number, min: number, field: string) {
    if (!isInt(String(value), { min })) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: `${field}: ${value} must be greater or equal than ${min}`,
      });
    }
  }

  isIntMax(value: number, max: number, field: string) {
    if (!isInt(String(value), { max })) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: `${field} must not be grater than ${max}`,
      });
    }
  }

  isFloatMax(value: number | string, max: number, field: string) {
    if (!isFloat(String(value), { max })) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: `${field} must not be grater than ${max}`,
      });
    }
  }

  isNumericString(value: string, field: string) {
    if (Number.isNaN(toFinite(value))) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: `${field}:${value} must be a numeric string`,
      });
    }
  }

  isNotIntFloat(value: number, field: string) {
    if (isFinite(value) && !Number.isNaN(value) && !Number.isInteger(value)) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: `${field} must not be float`,
      });
    }
  }

  throwError(message: string, field: string) {
    throw new DomainValidationError({
      field,
      domain: this.domain,
      message,
    });
  }
}

export { Validator };
