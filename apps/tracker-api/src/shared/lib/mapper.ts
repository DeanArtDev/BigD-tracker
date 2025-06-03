type DefaultType = object;

interface IMapper<
  DTO extends DefaultType,
  Entity extends DefaultType,
  RawData extends DefaultType,
> {
  fromPersistenceToEntity: (rawData: RawData) => Entity;
  fromDtoToEntity: (dto: DTO) => Entity;
  fromEntityToDTO: (entity: Entity) => DTO;
  fromPersistenceToDto?: (raw: RawData) => DTO;
}

abstract class BaseMapper<
  DTO extends DefaultType,
  Entity extends DefaultType,
  RawData extends DefaultType,
> implements IMapper<DTO, Entity, RawData>
{
  abstract fromPersistenceToEntity(rawData: RawData): Entity;
  abstract fromDtoToEntity(dto: DTO): Entity;
  abstract fromEntityToDTO(entity: Entity): DTO;
}

export { BaseMapper };
