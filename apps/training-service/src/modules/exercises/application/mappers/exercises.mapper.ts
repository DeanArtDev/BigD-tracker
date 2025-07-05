import { BaseMapper } from '@big-d/api-utils';
import { Injectable } from '@nestjs/common';
import { ExerciseEntity } from '@modules/exercises/domain';
import { ExerciseDto } from '../dtos/exercise.dto';

@Injectable()
class ExercisesMapper extends BaseMapper<ExerciseDto, ExerciseEntity> {
  constructor() {
    super();
  }

  fromEntityToDTO = (entity: ExerciseEntity): ExerciseDto => {
    return this.entityToDTO(entity, ExerciseDto);
  };
}

export { ExercisesMapper };
