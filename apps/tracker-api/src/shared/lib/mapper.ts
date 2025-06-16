type DefaultType = object;

interface IMapper<DTO extends DefaultType, Entity extends DefaultType> {
  fromDtoToEntity?: (dto: DTO) => Entity;
  fromEntityToDTO?: (entity: Entity) => DTO;
}

export { IMapper };
