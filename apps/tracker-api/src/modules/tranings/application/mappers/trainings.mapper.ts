import { TrainingDto } from '../dtos/training.dto';
import { IMapper } from '@shared/lib/mapper';
import { Injectable } from '@nestjs/common';
import { TrainingEntity } from '@/modules/tranings/domain/entities/training.entity';
import { mapEntity } from '@shared/lib/map-entity';

@Injectable()
class TrainingsMapper implements IMapper<TrainingDto, TrainingEntity> {
  fromEntityToDTO = (entity: TrainingEntity): TrainingDto => {
    return mapEntity(TrainingDto, entity);
  };
}

export { TrainingsMapper };
