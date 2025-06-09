import { ExerciseTemplateEntity } from '@/exercises-templates/entity/exercise-template.entity';
import { ExercisesTemplateMapper } from '@/exercises-templates/exercise-template.mapper';
import { ExercisesTemplatesRepository } from '@/exercises-templates/exercises-templates.repository';
import { RepetitionMapper } from '@/repetitions/repetitions.mapper';
import { RepetitionsRepository } from '@/repetitions/repetitions.repository';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { TrainingsAggregationService } from '../../trainings-aggregation.service';
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

    private readonly exerciseTemplateMapper: ExercisesTemplateMapper,
    private readonly exercisesTemplatesRepository: ExercisesTemplatesRepository,

    private readonly trainingsAggregationMapper: TrainingsAggregationMapper,
    private readonly trainingsAggregationService: TrainingsAggregationService,

    private readonly repetitionMapper: RepetitionMapper,
    private readonly repetitionsRepository: RepetitionsRepository,
  ) {}

  async execute(
    userId: number,
    dto: UpdateTrainingAggregationRequestData[],
  ): Promise<TrainingAggregationEntity[]> {
    const trainingAggregationList: TrainingAggregationEntity[] = [];

    for (const { exercises, ...item } of dto) {
      const trainingAggregation = await this.updateTraining(userId, item);

      const newExercises: ExerciseTemplateEntity[] = [];
      for (const exercise of exercises) {
        newExercises.push(await this.updateExercise(userId, trainingAggregation.id, exercise));
      }
      trainingAggregation.addExercises(newExercises);
      trainingAggregationList.push(trainingAggregation);
    }

    return trainingAggregationList;
  }

  private async updateExercise(
    userId: number,
    trainingId: number,
    data: UpdateTrainingAggregationExercise,
  ): Promise<ExerciseTemplateEntity> {
    const rawExercise = await this.exercisesTemplatesRepository.findOneById({ id: data.id });
    if (rawExercise == null) {
      throw new NotFoundException('Exercise template is not found');
    }

    const updateExerciseEntity = this.exerciseTemplateMapper.fromUpdateDtoToEntity(data, userId);
    updateExerciseEntity.addRepetitions(
      data.repetitions.map((i) =>
        this.repetitionMapper.fromDtoToEntity({ ...i, exerciseId: updateExerciseEntity.id }),
      ),
    );

    this.exerciseTemplateMapper.fromEntityToPersistence(updateExerciseEntity);

    try {
      const updatedRawExercise = await this.exercisesTemplatesRepository.update([data], {
        replace: true,
      });

      await this.repetitionsRepository.deleteByExerciseIds([data.id]);
      const repetitionEntities = await this.trainingsAggregationService.createRepetitions(
        userId,
        trainingId,
        data.id,
        data.repetitions,
      );

      return this.exerciseTemplateMapper
        .fromPersistenceToEntity({
          rawExercise: updatedRawExercise[0],
        })
        .addRepetitions(repetitionEntities);
    } catch {
      throw new InternalServerErrorException({ id: data.id }, { cause: 'Failed to update' });
    }
  }

  private async updateTraining(
    userId: number,
    dto: Omit<UpdateTrainingAggregationRequestData, 'exercises'>,
  ): Promise<TrainingAggregationEntity> {
    const rawTraining = await this.trainingsRepository.findOneById({ id: dto.id });
    if (rawTraining == null) {
      throw new NotFoundException(`training with id ${dto.id} not found`);
    }

    const updateTrainingEntity = this.trainingsAggregationMapper.fromUpdateDtoToEntity(dto, userId);

    updateTrainingEntity
      .updatePostTrainingDuration(updateTrainingEntity.postTrainingDuration ?? undefined)
      .updateWormUpDuration(updateTrainingEntity.wormUpDuration ?? undefined);

    const persistenceData =
      this.trainingsAggregationMapper.fromEntityToPersistence(updateTrainingEntity);
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
}
