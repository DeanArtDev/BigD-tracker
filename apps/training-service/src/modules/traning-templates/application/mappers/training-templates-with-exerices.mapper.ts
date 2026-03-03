import { Injectable } from '@nestjs/common';
import { TrainingTemplateWithExercisesDto } from '@big-d/api-contracts';
import { BaseMapper } from '@big-d/api-utils';
import { TrainingTemplateWithExercisesEntity } from '../../domain/entities';

@Injectable()
class TrainingTemplatesWithExercisesMapper extends BaseMapper<
  TrainingTemplateWithExercisesDto,
  TrainingTemplateWithExercisesEntity
> {
  fromEntityToDTO = (entity: TrainingTemplateWithExercisesEntity): TrainingTemplateWithExercisesDto => {
    return this.entityToDTO(entity, TrainingTemplateWithExercisesDto);
  };
}

export { TrainingTemplatesWithExercisesMapper };
