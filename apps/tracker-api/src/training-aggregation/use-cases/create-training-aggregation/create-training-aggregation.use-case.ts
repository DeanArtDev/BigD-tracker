import { ExerciseEntity } from '@/exercises/entity/exercise.entity';
import { ExercisesTemplateMapper } from '@/exercises/exercise-template.mapper';
import { ExercisesMapper } from '@/exercises/exercise.mapper';
import { ExercisesTemplatesRepository } from '@/exercises/exercises-templates.repository';
import { ExercisesRepository } from '@/exercises/exercises.repository';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TrainingAggregationEntity } from '../../entities/training-aggregation.entity';
import { CreateTrainingAggregationRequestData } from './create-training-aggregation.dto';
import { TrainingsAggregationMapper } from '../../trainings-aggregation.mapper';

@Injectable()
export class CreateTrainingAggregationUseCase {
  constructor(
    private readonly trainingsRepository: TrainingsRepository,
    private readonly exerciseRepository: ExercisesRepository,
    private readonly exerciseTemplatesRepository: ExercisesTemplatesRepository,
    private readonly trainingsAggregationMapper: TrainingsAggregationMapper,
    private readonly exercisesMapper: ExercisesMapper,
    private readonly exercisesTemplateMapper: ExercisesTemplateMapper,
  ) {}

  async execute(
    userId: number,
    dto: CreateTrainingAggregationRequestData[],
  ): Promise<TrainingAggregationEntity[]> {
    const trainingAggregationList: TrainingAggregationEntity[] = [];

    for (const { exercises, ...item } of dto) {
      const rawTraining = await this.trainingsRepository.create({ userId, ...item });
      if (rawTraining == null) {
        throw new InternalServerErrorException('Failed to create training');
      }
      const trainingAggregation = this.trainingsAggregationMapper.fromRaw({ rawTraining });

      const newExercises: ExerciseEntity[] = [];
      for (const e of exercises) {
        const rawExerciseTemplate = await this.exerciseTemplatesRepository.findOneById({
          id: e.id,
        });
        if (rawExerciseTemplate == null) {
          throw new NotFoundException('Exercise template is not found');
        }
        const exerciseTemplate = this.exercisesTemplateMapper.fromRaw(rawExerciseTemplate);

        const newRawExercise = await this.exerciseRepository.create({
          userId,
          trainingId: trainingAggregation.id,
          name: exerciseTemplate.name,
          type: exerciseTemplate.type,
          exampleUrl: exerciseTemplate.exampleUrl,
          description: exerciseTemplate.description,
        });

        if (newRawExercise == null) {
          throw new InternalServerErrorException(`Failed to create exercise`);
        }

        newExercises.push(this.exercisesMapper.fromRaw(newRawExercise));
      }
      trainingAggregation.addExercises(newExercises);
      trainingAggregationList.push(trainingAggregation);
    }

    return trainingAggregationList;
  }
}
