import { InternalServerErrorException } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export function mapAndValidateEntityList<T extends Record<string, any>, V>(
  dto: ClassConstructor<T>,
  plainArray: V[],
  options = {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  },
): T[] {
  const instances = plainToInstance(dto, plainArray, options);

  const allErrors = instances.flatMap((instance, index) =>
    validateSync(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    }).map((error) => ({ index, error })),
  );

  if (allErrors.length > 0) {
    throw new InternalServerErrorException(
      `Invalid data in array returned from repository: ${JSON.stringify(allErrors)}`,
    );
  }

  return instances;
}
