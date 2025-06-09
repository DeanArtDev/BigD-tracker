import { Injectable } from '@nestjs/common';
import { mapEntity } from '@shared/lib/map-entity';
import { BaseMapper } from '@shared/lib/mapper';
import { DB } from '@shared/modules/db';
import { Insertable, Selectable, Updateable } from 'kysely/dist/esm';
import { CreateRepetitionsDto } from './dto/create-repetitions.dto';
import { RepetitionsDto } from './dto/repetitions.dto';
import { RepetitionEntity } from './repetitions.entity';
import { UpdateRepetitionsDto } from './dto/update-repetitions.dto';

interface RepetitionRawData {
  readonly selectable: Selectable<DB['repetitions']>;
  readonly updateable: Updateable<DB['repetitions']>;
  readonly insertable: Insertable<DB['repetitions']>;
}

@Injectable()
class RepetitionMapper extends BaseMapper<
  RepetitionsDto,
  RepetitionEntity,
  RepetitionRawData['selectable']
> {
  fromPersistenceToEntity = (raw: RepetitionRawData['selectable']): RepetitionEntity => {
    return new RepetitionEntity({
      id: raw.id,
      exerciseId: raw.exercises_id,
      userId: raw.user_id ?? undefined,
      targetBreak: raw.target_break,
      targetCount: raw.target_count,
      targetWeight: raw.target_weight,
    });
  };

  fromCreateDtoToEntity = (dto: CreateRepetitionsDto): RepetitionEntity => {
    return new RepetitionEntity({
      ...dto,
      id: Infinity,
      exerciseId: Infinity,
    });
  };

  fromUpdateDtoToEntity = (dto: UpdateRepetitionsDto): RepetitionEntity => {
    return new RepetitionEntity({
      ...dto,
      exerciseId: Infinity,
    });
  };

  fromDtoToEntity = (dto: RepetitionsDto): RepetitionEntity => {
    return new RepetitionEntity(dto);
  };

  fromEntityToDTO = (entity: RepetitionEntity): RepetitionsDto => {
    return mapEntity(RepetitionsDto, entity);
  };
}

export { RepetitionMapper, type RepetitionRawData };
