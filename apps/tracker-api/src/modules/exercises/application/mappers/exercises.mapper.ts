import { Injectable } from '@nestjs/common';
import { mapEntity } from '@shared/lib/map-entity';
import { IMapper } from '@shared/lib/mapper';
import { ExerciseEntity } from '../../domain/exercise.entity';
import { ExerciseDto } from '../dtos/exercise.dto';

@Injectable()
class ExercisesMapper implements IMapper<ExerciseDto, ExerciseEntity> {
  constructor() {}

  fromEntityToDTO = (entity: ExerciseEntity): ExerciseDto => {
    return mapEntity(ExerciseDto, entity);
  };
}

export { ExercisesMapper };
