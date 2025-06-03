import { ExerciseDto } from '@/exercises/dtos/exercise.dto';
import { TrainingAggregationDto } from '@/training-aggregation/dto/training-aggregation.dto';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ExerciseEntity } from '@/exercises/entity/exercise.entity';
import { ExercisesMapper } from '@/exercises/exercise.mapper';
import { ExercisesRepository } from '@/exercises/exercises.repository';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { TrainingAggregationEntity } from '../../entities/training-aggregation.entity';
import { TrainingsAggregationMapper } from '../../trainings-aggregation.mapper';
import {
  UpdateTrainingAggregationExercise,
  UpdateTrainingAggregationRequestData,
} from './update-training-aggregation.dto';

@Injectable()
export class UpdateTrainingAggregationUseCase {
  constructor(
    private readonly trainingsRepository: TrainingsRepository,
    private readonly exerciseRepository: ExercisesRepository,
    private readonly trainingsAggregationMapper: TrainingsAggregationMapper,
    private readonly exercisesMapper: ExercisesMapper,
  ) {}

  async execute(
    userId: number,
    dto: UpdateTrainingAggregationRequestData[],
  ): Promise<TrainingAggregationEntity[]> {
    const trainingAggregationList: TrainingAggregationEntity[] = [];

    for (const { exercises, ...item } of dto) {
      const trainingAggregation = await this.updateTraining(item);

      const newExercises: ExerciseEntity[] = [];
      for (const exercise of exercises) {
        newExercises.push(await this.updateExercise(exercise));
      }
      trainingAggregation.addExercises(newExercises);
      trainingAggregationList.push(trainingAggregation);
    }

    return trainingAggregationList;
  }

  private async updateExercise(data: UpdateTrainingAggregationExercise): Promise<ExerciseEntity> {
    const rawExercise = await this.exerciseRepository.findOneById({ id: data.id });
    if (rawExercise == null) {
      throw new NotFoundException('Exercise template is not found');
    }

    const exerciseDto = this.exercisesMapper.fromPersistenceToDto(rawExercise);
    const entity = this.exercisesMapper.fromDtoToEntity(
      this.mergeUpdateExerciseDtoWithDto(data, exerciseDto),
    );

    const persistenceData = this.exercisesMapper.fromEntityToPersistence(entity);
    const updatedRawTraining = await this.exerciseRepository.update(persistenceData, {
      replace: true,
    });
    if (updatedRawTraining == null) {
      throw new InternalServerErrorException({ id: data.id }, { cause: 'Failed to update' });
    }
    return this.exercisesMapper.fromPersistenceToEntity(updatedRawTraining);
  }

  private async updateTraining(
    dto: Omit<UpdateTrainingAggregationRequestData, 'exercises'>,
  ): Promise<TrainingAggregationEntity> {
    const rawTraining = await this.trainingsRepository.findOneById({ id: dto.id });
    if (rawTraining == null) {
      throw new NotFoundException(`training with id ${dto.id} not found`);
    }

    const trainingDto = this.trainingsAggregationMapper.fromPersistenceToDto({ rawTraining });
    const entity = this.trainingsAggregationMapper.fromDtoToEntity(
      this.mergeUpdateTrainingDtoWithDto(dto, trainingDto),
    );

    const persistenceData = this.trainingsAggregationMapper.fromEntityToPersistence(entity);
    const updatedRawTraining = await this.trainingsRepository.update(persistenceData.rawTraining, {
      replace: true,
    });
    if (updatedRawTraining == null) {
      throw new InternalServerErrorException({ id: dto.id }, { cause: 'Failed to update' });
    }
    return this.trainingsAggregationMapper.fromPersistenceToEntity({
      rawTraining: updatedRawTraining,
    });
  }

  private mergeUpdateTrainingDtoWithDto(
    updateDto: Omit<UpdateTrainingAggregationRequestData, 'exercises'>,
    trainingDto: TrainingAggregationDto,
  ): TrainingAggregationEntity {
    const { id, name, type, startDate, description, wormUpDuration, postTrainingDuration } =
      updateDto;
    return this.trainingsAggregationMapper
      .fromDtoToEntity({
        ...trainingDto,
        id,
        name,
        type,
        startDate,
        description: description ?? undefined,
      })
      .updatePostTrainingDuration(postTrainingDuration ?? undefined)
      .updateWormUpDuration(wormUpDuration ?? undefined);
  }

  private mergeUpdateExerciseDtoWithDto(
    updateDto: UpdateTrainingAggregationExercise,
    exerciseDto: ExerciseDto,
  ): ExerciseEntity {
    const { id, name, type, description, trainingId, exampleUrl } = updateDto;

    return this.exercisesMapper.fromDtoToEntity({
      ...exerciseDto,
      id,
      name,
      type,
      trainingId,
      exampleUrl: exampleUrl ?? undefined,
      description: description ?? undefined,
    });
  }
}
