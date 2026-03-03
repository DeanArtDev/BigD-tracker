import { TrainingWithExercisesDto } from '@big-d/api-contracts';
import { BaseMapper } from '@big-d/api-utils';
import { TrainingWithExercisesEntity } from '@modules/tranings/domain';
import { Injectable } from '@nestjs/common';

@Injectable()
class TrainingsWithExercisesMapper extends BaseMapper<TrainingWithExercisesDto, TrainingWithExercisesEntity> {
  constructor() {
    super();
  }

  fromEntityToDTO = (entity: TrainingWithExercisesEntity): TrainingWithExercisesDto => {
    return this.entityToDTO(entity, TrainingWithExercisesDto);
  };
}

export { TrainingsWithExercisesMapper };
