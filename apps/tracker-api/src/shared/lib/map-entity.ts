import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer';

export function mapEntity<T extends Record<string, any>, V>(
  entity: ClassConstructor<T>,
  plain: V,
  options: ClassTransformOptions = {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  },
): T {
  return plainToInstance(entity, plain, options);
}
