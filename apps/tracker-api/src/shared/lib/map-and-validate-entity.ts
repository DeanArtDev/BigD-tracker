import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validateSync } from 'class-validator';
import { InternalServerErrorException } from '@nestjs/common';

export function mapAndValidateEntity<T extends Record<string, any>, V>(
  entity: ClassConstructor<T>,
  plain: V,
  options = {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  },
): T {
  const instance = plainToInstance(entity, plain, options);

  const errors = validateSync(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (errors.length > 0) {
    console.log(errors);
    throw new InternalServerErrorException(errors, {
      cause: 'Invalid entity structure',
    });
  }

  return instance;
}
