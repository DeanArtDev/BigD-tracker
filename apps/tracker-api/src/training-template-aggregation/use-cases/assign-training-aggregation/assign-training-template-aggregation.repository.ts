import { Injectable } from '@nestjs/common';
import { KyselyService } from '@shared/modules/db';

@Injectable()
export class AssignTrainingTemplateAggregationRepository {
  constructor(private readonly kyselyService: KyselyService) {}

  async attachExerciseTemplateToTraining(trainingId: number, exerciseIds: number[]): Promise<void> {
    await this.kyselyService.db
      .insertInto('trainings_exercise_templates')
      .values(
        exerciseIds.map((i, index) => ({
          exercise_template_id: i,
          training_id: trainingId,
          order: index,
        })),
      )
      .execute();
  }
}
