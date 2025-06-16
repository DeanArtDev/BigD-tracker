import { Injectable } from '@nestjs/common';
import { mapEntity } from '@shared/lib/map-entity';
import { IMapper } from '@shared/lib/mapper';
import { TrainingTemplateWithExercisesEntity } from '../../domain/entities';
import { TrainingTemplateWithExercisesDto } from '../dtos/training-template-with-exercises.dto';

@Injectable()
class TrainingTemplatesWithExercisesMapper
  implements IMapper<TrainingTemplateWithExercisesDto, TrainingTemplateWithExercisesEntity>
{
  fromEntityToDTO = (
    entity: TrainingTemplateWithExercisesEntity,
  ): TrainingTemplateWithExercisesDto => {
    return mapEntity(TrainingTemplateWithExercisesDto, entity);
  };
}

export { TrainingTemplatesWithExercisesMapper };
