import { isValidAbsoluteDateTimeWithoutTimezone } from '@big-d/api-utils';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsAbsoluteDateTimeWithoutTimezone', async: false })
class IsAbsoluteDateTimeWithoutTimezoneConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isValidAbsoluteDateTimeWithoutTimezone(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be in format YYYY-MM-DDTHH:mm without timezone`;
  }
}

function IsAbsoluteDateTimeWithoutTimezone(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAbsoluteDateTimeWithoutTimezoneConstraint,
    });
  };
}

export { IsAbsoluteDateTimeWithoutTimezone, IsAbsoluteDateTimeWithoutTimezoneConstraint };
