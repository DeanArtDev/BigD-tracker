type DefaultType = object;

interface IMapper<
  DTO extends DefaultType,
  Entity extends DefaultType,
  RawData extends DefaultType,
> {
  fromRaw: (rawData: RawData) => Entity;
  toEntity: (dto: DTO) => Entity;
  toDTO: (entity: Entity) => DTO;
}

abstract class BaseMapper<
  DTO extends DefaultType,
  Entity extends DefaultType,
  RawData extends DefaultType,
> implements IMapper<DTO, Entity, RawData>
{
  abstract fromRaw(rawData: RawData): Entity;
  abstract toEntity(dto: DTO): Entity;
  abstract toDTO(entity: Entity): DTO;
}

export { BaseMapper };
