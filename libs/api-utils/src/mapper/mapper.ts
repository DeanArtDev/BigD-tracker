import { ClassConstructor, plainToInstance } from 'class-transformer';

type DefaultType = Record<string, any>;

class BaseMapper<DTO extends DefaultType, Entity extends DefaultType> {
  protected entityToDTO = (entity: Entity, dto: ClassConstructor<DTO>): DTO => {
    return plainToInstance(dto, entity, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  };
}

export { BaseMapper };
