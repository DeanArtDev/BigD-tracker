import { Injectable } from '@nestjs/common';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { BaseMapper } from '@shared/lib/mapper';
import { DB } from '@shared/modules/db';
import { Insertable, Selectable, Updateable } from 'kysely/dist/esm';
import { toFinite } from 'lodash-es';
import { RepetitionsDto } from './dto/repetitions.dto';
import { RepetitionEntity, RepetitionFinishType } from './repetitions.entity';

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
      factBreak: raw.fact_break ?? undefined,
      targetCount: raw.target_count,
      factCount: raw.fact_count ?? undefined,
      targetWeight: toFinite(raw.target_weight),
      factWeight: raw.fact_weight != null ? toFinite(raw.fact_weight) : undefined,
      finishType: raw.finish_type as RepetitionFinishType,
    });
  };

  fromDtoToEntity = (dto: RepetitionsDto): RepetitionEntity => {
    return new RepetitionEntity(dto);
  };

  fromEntityToDTO = (entity: RepetitionEntity): RepetitionsDto => {
    return mapAndValidateEntity(RepetitionsDto, entity);
  };
}

export { RepetitionMapper, type RepetitionRawData };
