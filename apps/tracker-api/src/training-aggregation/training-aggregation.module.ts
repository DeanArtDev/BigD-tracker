import { TrainingsAggregationMapper } from './trainings-aggregation.mapper';
import { Module } from '@nestjs/common';
import { TrainingsModule } from '@/tranings/trainings.module';
import { UpdateTrainingAggregationUseCase } from './use-cases/update-training-aggregation';
import { CreateTrainingAggregationUseCase } from './use-cases/create-training-aggregation';
import { TrainingAggregationRepository } from './training-aggregation.repository';
import { TrainingAggregationController } from './training-aggregation.controller';
import { TrainingsAggregationService } from './trainings-aggregation.service';
import { ExerciseTemplatesModule } from '@/exercises-templates/exercise-templates.module';

@Module({
  exports: [TrainingsAggregationMapper],
  imports: [TrainingsModule, ExerciseTemplatesModule],
  controllers: [TrainingAggregationController],
  providers: [
    CreateTrainingAggregationUseCase,
    UpdateTrainingAggregationUseCase,
    TrainingsAggregationService,
    TrainingsAggregationMapper,
    TrainingAggregationRepository,
  ],
})
export class TrainingAggregationModule {}
