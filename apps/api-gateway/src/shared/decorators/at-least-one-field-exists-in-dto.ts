import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'AtLeastOneFieldExistsInDto', async: false })
class AtLeastOneFieldExistsConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const object = args.object as Record<string, any>;
    const keysToCheck = args.constraints as string[];

    return keysToCheck.some((key) => object[key] !== undefined);
  }

  defaultMessage(args: ValidationArguments): string {
    const keys = args.constraints as string[];
    return `Должно быть указано хотя бы одно из полей: ${keys.join(', ')}`;
  }
}

function AtLeastOneFieldExistsInDto<Entity extends Record<string, any>>(
  fields: (keyof Entity)[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: fields,
      validator: AtLeastOneFieldExistsConstraint,
    });
  };
}

export { AtLeastOneFieldExistsInDto };
