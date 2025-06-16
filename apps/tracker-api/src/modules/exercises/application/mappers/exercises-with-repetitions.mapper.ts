import { ExerciseWithRepetitionsDto } from '../dtos/exercise-with-repetitions.dto';
import { ExerciseWithRepetitionsEntity } from '../../domain/exercise-with-repetitions.entity';
import { Injectable } from '@nestjs/common';
import { mapEntity } from '@shared/lib/map-entity';
import { IMapper } from '@shared/lib/mapper';

@Injectable()
class ExercisesWithRepetitionsMapper
  implements IMapper<ExerciseWithRepetitionsDto, ExerciseWithRepetitionsEntity>
{
  constructor() {}

  fromEntityToDTO = (entity: ExerciseWithRepetitionsEntity): ExerciseWithRepetitionsDto => {
    return mapEntity(ExerciseWithRepetitionsDto, entity);
  };
}

export { ExercisesWithRepetitionsMapper };
