import { ExerciseTemplateRawData } from '@/exercises/exercise-template.mapper';
import { TrainingRawData } from '@/tranings/trainings.mapper';
import { Injectable } from '@nestjs/common';
import { KyselyService } from '@shared/modules/db';

export interface TrainingAggregationRaw {
  trainingTemplate: TrainingRawData['selectable'];
  exercises: ExerciseTemplateRawData['selectable'][];
}

@Injectable()
export class TrainingAggregationRepository {
  constructor(private readonly kyselyService: KyselyService) {}

  async findAllTrainingAggregation(
    userId: number,
    filters?: { from?: string; to?: string },
    options?: { order: 'asc' | 'desc'; exerciseOrder: 'asc' | 'desc' },
  ): Promise<TrainingAggregationRaw[] | undefined> {
    const { order = 'desc', exerciseOrder = 'desc' } = options ?? {};
    const { to, from } = filters ?? {};

    let query = this.getAllTemplateRelationsQuery()
      .orderBy('trainings.updated_at', order)
      .orderBy('many_to_many_table.order', exerciseOrder)
      .where('trainings.user_id', '=', userId);

    if (from != null && to != null) {
      query = query.where((eb) => {
        return eb.and([
          eb('start_date', '>=', new Date(from)),
          eb('start_date', '<=', new Date(to)),
        ]);
      });
    }

    const result = await query.execute();
    if (result.length == 0) return undefined;

    const hashMap = new Map<number, Awaited<typeof result>>();
    for (const item of result) {
      if (hashMap.has(item.training_id)) {
        hashMap.get(item.training_id)?.push(item);
      } else {
        hashMap.set(item.training_id, [item]);
      }
    }

    return Array.from(hashMap.values()).map((item) =>
      this.mapper.trainingTemplateToPersistence({
        training: item[0],
        exercises: item,
      }),
    );
  }

  private getAllTemplateRelationsQuery() {
    return this.kyselyService.db
      .selectFrom('trainings')
      .leftJoin(
        'trainings_exercise_templates as many_to_many_table',
        'trainings.id',
        'many_to_many_table.training_id',
      )
      .leftJoin(
        'exercises_templates',
        'exercises_templates.id',
        'many_to_many_table.exercise_template_id',
      )
      .select([
        'trainings.created_at as training_created_at',
        'trainings.description as training_description',
        'trainings.id as training_id',
        'trainings.name as training_name',
        'trainings.post_training_duration as training_post_training_duration',
        'trainings.type as training_type',
        'trainings.updated_at as training_updated_at',
        'trainings.start_date as training_start_date',
        'trainings.end_date as training_end_date',
        'trainings.user_id as training_user_id',
        'trainings.worm_up_duration as training_worm_up_duration',

        'exercises_templates.created_at as exercise_created_at',
        'exercises_templates.description as exercise_description',
        'exercises_templates.id as exercise_id',
        'exercises_templates.name as exercise_name',
        'exercises_templates.type as exercise_type',
        'exercises_templates.updated_at as exercise_updated_at',
        'exercises_templates.user_id as exercise_user_id',
        'exercises_templates.example_url as exercise_example_url',
      ]);
  }

  private get mapper() {
    type ManyToManyTemplateAggregation = Awaited<
      ReturnType<ReturnType<typeof this.getAllTemplateRelationsQuery>['execute']>
    >[0];

    return {
      trainingTemplateToPersistence: (data: {
        training: Pick<
          ManyToManyTemplateAggregation,
          | 'training_created_at'
          | 'training_description'
          | 'training_id'
          | 'training_name'
          | 'training_post_training_duration'
          | 'training_type'
          | 'training_start_date'
          | 'training_end_date'
          | 'training_updated_at'
          | 'training_user_id'
          | 'training_worm_up_duration'
        >;
        exercises: Pick<
          ManyToManyTemplateAggregation,
          | 'exercise_id'
          | 'exercise_name'
          | 'exercise_description'
          | 'exercise_updated_at'
          | 'exercise_created_at'
          | 'exercise_type'
          | 'exercise_user_id'
          | 'exercise_example_url'
        >[];
      }): TrainingAggregationRaw => {
        const exercises = data.exercises
          .filter((e) => e.exercise_id != null)
          .map((exercise) => {
            return {
              id: exercise.exercise_id,
              name: exercise.exercise_name,
              description: exercise.exercise_description,
              updated_at: exercise.exercise_updated_at,
              created_at: exercise.exercise_created_at,
              type: exercise.exercise_type,
              user_id: exercise.exercise_user_id,
              example_url: exercise.exercise_example_url,
            } as ExerciseTemplateRawData['selectable'];
          });

        return {
          exercises,
          trainingTemplate: {
            id: data.training.training_id,
            name: data.training.training_name,
            description: data.training.training_description,
            updated_at: data.training.training_updated_at,
            created_at: data.training.training_created_at,
            type: data.training.training_type,
            user_id: data.training.training_user_id,
            end_date: data.training.training_end_date,
            start_date: data.training.training_start_date,
            post_training_duration: data.training.training_post_training_duration,
            worm_up_duration: data.training.training_worm_up_duration,
          },
        };
      },
    };
  }
}
