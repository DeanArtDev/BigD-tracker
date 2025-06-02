import { Injectable } from '@nestjs/common';
import { ExerciseRawData, ExercisesMapper } from '@/exercises/exercise.mapper';
import { TrainingRawData, TrainingsMapper } from '@/tranings/trainings.mapper';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { TrainingAggregationDto } from './dto/training-aggregation.dto';
import { TrainingAggregationEntity } from './entities/training-aggregation.entity';

@Injectable()
export class TrainingsAggregationMapper {
  constructor(
    private readonly trainingsMapper: TrainingsMapper,
    private readonly exercisesMapper: ExercisesMapper,
  ) {}

  fromRaw = (raw: {
    rawTraining: TrainingRawData;
    rawExercises?: ExerciseRawData[];
  }): TrainingAggregationEntity => {
    const { rawTraining, rawExercises = [] } = raw;
    const trainingAggregation = new TrainingAggregationEntity(
      this.trainingsMapper.fromRaw(rawTraining),
    );
    return trainingAggregation.addExercises(rawExercises.map(this.exercisesMapper.fromRaw));
  };

  toEntity = (dto: TrainingAggregationDto): TrainingAggregationEntity => {
    return new TrainingAggregationEntity(dto).addExercises(
      dto.exercises.map(this.exercisesMapper.toEntity),
    );
  };

  toDTO = (entity: TrainingAggregationEntity): TrainingAggregationDto => {
    return mapAndValidateEntity(TrainingAggregationDto, entity);
  };
}
