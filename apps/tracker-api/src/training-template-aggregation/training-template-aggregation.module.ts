import { ExerciseTemplatesModule } from '@/exercises-templates/exercise-templates.module';
import { RepetitionsModule } from '@/repetitions/repetitions.module';
import { TrainingAggregationModule } from '@/training-aggregation/training-aggregation.module';
import { TrainingsModule } from '@/tranings/trainings.module';
import { Module } from '@nestjs/common';
import { TrainingTemplateAggregationController } from './training-template-aggregation.controller';
import { TrainingTemplateAggregationMapper } from './training-template-aggregation.mapper';
import { TrainingTemplateAggregationService } from './training-template-aggregation.service';
import { TrainingTemplatesAggregationRepository } from './training-templates-aggregation.repository';
import {
  AssignTrainingTemplateAggregationRepository,
  AssignTrainingTemplateAggregationUseCase,
} from './use-cases/assign-training-aggregation';
import { CreateTrainingTemplateAggregationUseCase } from './use-cases/create-training-aggregation';
import { UpdateTrainingTemplateAggregationUseCase } from './use-cases/update-training-aggregation';

@Module({
  exports: [TrainingTemplateAggregationMapper],
  imports: [TrainingsModule, ExerciseTemplatesModule, TrainingAggregationModule, RepetitionsModule],
  controllers: [TrainingTemplateAggregationController],
  providers: [
    CreateTrainingTemplateAggregationUseCase,
    TrainingTemplateAggregationService,
    TrainingTemplateAggregationMapper,
    TrainingTemplatesAggregationRepository,
    UpdateTrainingTemplateAggregationUseCase,
    AssignTrainingTemplateAggregationRepository,
    AssignTrainingTemplateAggregationUseCase,
  ],
})
export class TrainingTemplateAggregationModule {}
