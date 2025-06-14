import { TrainingWithExercisesDto } from '../dtos/training-with-exercises.dto';
import { TrainingWithExercisesEntity } from '../../domain/entities/training-with-exercises.entity';
import { IMapper } from '@shared/lib/mapper';
import { Injectable } from '@nestjs/common';
import { mapEntity } from '@shared/lib/map-entity';

@Injectable()
class TrainingsWithExercisesMapper
  implements IMapper<TrainingWithExercisesDto, TrainingWithExercisesEntity>
{
  fromEntityToDTO = (entity: TrainingWithExercisesEntity): TrainingWithExercisesDto => {
    return mapEntity(TrainingWithExercisesDto, entity);
  };
}

export { TrainingsWithExercisesMapper };
