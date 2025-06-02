import { isAfter, isInt, isURL } from 'validator';
import isISO8601 from 'validator/lib/isISO8601';
import { DomainValidationError } from './domain-validation.error';

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

  isIdValId(id: number, field: string) {
    if (id <= 0) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: `id must not be valid id:${id}`,
      });
    }
  }

  isDateAfter(str: string, date: string, field: string) {
    if (!isAfter(str, date)) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: `${field}: ${str} must be before ${date}`,
      });
    }
  }

  isIntGt(value: number, gt: number, field: string) {
    if (!isInt(String(value), { gt })) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: `${field} must not be greater than ${gt}`,
      });
    }
  }

  isIntLt(value: number, lt: number, field: string) {
    if (!isInt(String(value), { lt })) {
      throw new DomainValidationError({
        field,
        domain: this.domain,
        message: `${field} must not be less than ${lt}`,
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
