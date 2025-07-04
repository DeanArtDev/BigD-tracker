import { BaseMapper } from '@big-d/api-utils';
import { Injectable } from '@nestjs/common';
import { ExerciseWithRepetitionsEntity } from '@modules/exercises/domain';
import { ExerciseWithRepetitionsDto } from '../dtos/exercise-with-repetitions.dto';

@Injectable()
class ExercisesWithRepetitionsMapper extends BaseMapper<
  ExerciseWithRepetitionsDto,
  ExerciseWithRepetitionsEntity
> {
  constructor() {
    super();
  }

  fromEntityToDTO = (entity: ExerciseWithRepetitionsEntity): ExerciseWithRepetitionsDto => {
    return this.entityToDTO(entity, ExerciseWithRepetitionsDto);
  };
}

export { ExercisesWithRepetitionsMapper };
