import { Injectable } from '@nestjs/common';
import { mapEntity } from '@shared/lib/map-entity';
import { IMapper } from '@shared/lib/mapper';
import { ExerciseEntity } from '../../domain/exercise.entity';
import { ExerciseDto } from '../dtos/exercise.dto';
import { ExerciseRawData } from '../exercises.repository';

@Injectable()
class ExercisesMapper implements IMapper<ExerciseDto, ExerciseEntity> {
  constructor() {}

  fromEntityToPersistence = (entity: ExerciseEntity): ExerciseRawData['selectable'] => {
    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      description: entity.description ?? null,
      example_url: entity.exampleUrl ?? null,
      user_id: entity.userId ?? null,
      training_id: entity.trainingId ?? null,
      training_template_id: entity.trainingTemplateId ?? null,
    };
  };

  fromEntityToDTO = (entity: ExerciseEntity): ExerciseDto => {
    return mapEntity(ExerciseDto, entity);
  };
}

export { ExercisesMapper };
