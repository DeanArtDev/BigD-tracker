import { ExercisesModule } from '@/exercises/exercises.module';
import { TrainingsModule } from '@/tranings/trainings.module';
import { Module } from '@nestjs/common';
import { TrainingTemplateAggregationController } from './training-template-aggregation.controller';
import { TrainingTemplateAggregationMapper } from './training-template-aggregation.mapper';
import { TrainingTemplateAggregationService } from './training-template-aggregation.service';
import { CreateTrainingTemplateAggregationUseCase } from './use-cases/create-training-aggregation';
import { UpdateTrainingTemplateAggregationUseCase } from './use-cases/update-training-aggregation';
import { TrainingTemplatesAggregationRepository } from './training-templates-aggregation.repository';

@Module({
  imports: [TrainingsModule, ExercisesModule],
  controllers: [TrainingTemplateAggregationController],
  providers: [
    CreateTrainingTemplateAggregationUseCase,
    TrainingTemplateAggregationService,
    TrainingTemplateAggregationMapper,
    TrainingTemplatesAggregationRepository,
    UpdateTrainingTemplateAggregationUseCase,
  ],
})
export class TrainingTemplateAggregationModule {}
