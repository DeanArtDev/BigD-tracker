import { ExerciseTemplateDto } from '@/exercises/dtos/exercise-template.dto';
import { ExerciseTemplateEntity } from '@/exercises/entity/exercise-template.entity';
import { ExercisesTemplateMapper } from '@/exercises/exercise-template.mapper';
import { ExercisesTemplatesRepository } from '@/exercises/exercises-templates.repository';
import { TrainingAggregationDto } from '@/training-aggregation/dto/training-aggregation.dto';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
    private readonly exercisesTemplatesRepository: ExercisesTemplatesRepository,
    private readonly trainingsAggregationMapper: TrainingsAggregationMapper,
    private readonly exerciseTemplateMapper: ExercisesTemplateMapper,
  ) {}

  async execute(
    userId: number,
    dto: UpdateTrainingAggregationRequestData[],
  ): Promise<TrainingAggregationEntity[]> {
    const trainingAggregationList: TrainingAggregationEntity[] = [];

    for (const { exercises, ...item } of dto) {
      const trainingAggregation = await this.updateTraining(item);

      const newExercises: ExerciseTemplateEntity[] = [];
      for (const exercise of exercises) {
        newExercises.push(await this.updateExercise(exercise));
      }
      trainingAggregation.addExercises(newExercises);
      trainingAggregationList.push(trainingAggregation);
    }

    return trainingAggregationList;
  }

  private async updateExercise(
    data: UpdateTrainingAggregationExercise,
  ): Promise<ExerciseTemplateEntity> {
    const rawExercise = await this.exercisesTemplatesRepository.findOneById({ id: data.id });
    if (rawExercise == null) {
      throw new NotFoundException('Exercise template is not found');
    }

    const exerciseDto = this.exerciseTemplateMapper.fromPersistenceToDto(rawExercise);
    const entity = this.exerciseTemplateMapper.fromDtoToEntity(
      this.mergeUpdateExerciseDtoWithDto(data, exerciseDto),
    );

    const persistenceData = this.exerciseTemplateMapper.fromEntityToPersistence(entity);
    const updatedRawTraining = await this.exercisesTemplatesRepository.update([persistenceData], {
      replace: true,
    });
    if (updatedRawTraining == null || updatedRawTraining.length === 0) {
      throw new InternalServerErrorException({ id: data.id }, { cause: 'Failed to update' });
    }

    return this.exerciseTemplateMapper.fromPersistenceToEntity(updatedRawTraining[0]);
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
    exerciseDto: ExerciseTemplateDto,
  ): ExerciseTemplateEntity {
    const { id, name, type, description, exampleUrl } = updateDto;

    return this.exerciseTemplateMapper.fromDtoToEntity({
      ...exerciseDto,
      id,
      name,
      type,
      exampleUrl: exampleUrl ?? undefined,
      description: description ?? undefined,
    });
  }
}
