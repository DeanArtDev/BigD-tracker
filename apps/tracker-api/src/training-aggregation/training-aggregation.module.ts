import { ExercisesModule } from '@/exercises/exercises.module';
import { TrainingsAggregationMapper } from './trainings-aggregation.mapper';
import { Module } from '@nestjs/common';
import { TrainingsModule } from '@/tranings/trainings.module';
import { UpdateTrainingAggregationUseCase } from './use-cases/update-training-aggregation';
import { CreateTrainingAggregationUseCase } from './use-cases/create-training-aggregation';
import { TrainingAggregationController } from './training-aggregation.controller';
import { TrainingsAggregationService } from './trainings-aggregation.service';

@Module({
  imports: [TrainingsModule, ExercisesModule],
  controllers: [TrainingAggregationController],
  providers: [
    CreateTrainingAggregationUseCase,
    UpdateTrainingAggregationUseCase,
    TrainingsAggregationService,
    TrainingsAggregationMapper,
  ],
})
export class TrainingAggregationModule {}
