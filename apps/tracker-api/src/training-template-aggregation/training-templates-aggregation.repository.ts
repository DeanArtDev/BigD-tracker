import { ExerciseTemplateRawData } from '@/exercises/exercise-template.mapper';
import { ExercisesTemplatesRepository } from '@/exercises/exercises-templates.repository';
import { TrainingTemplateRawData } from '@/tranings/trainings-template.mapper';
import { TrainingsTemplatesRepository } from '@/tranings/trainings-templates.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Override } from '@shared/lib/type-helpers';
import { KyselyService } from '@shared/modules/db';

export interface TrainingTemplatesAggregationRaw {
  trainingTemplate: TrainingTemplateRawData['selectable'];
  exercises: ExerciseTemplateRawData['selectable'][];
}

@Injectable()
export class TrainingTemplatesAggregationRepository {
  constructor(
    private readonly kyselyService: KyselyService,
    private readonly exercisesTemplatesRepository: ExercisesTemplatesRepository,
    private readonly trainingsTemplatesRepository: TrainingsTemplatesRepository,
  ) {}

  async createTrainingTemplateAggregation(data: {
    trainingTemplate: TrainingTemplateRawData['insertable'];
    exerciseTemplates: Override<ExerciseTemplateRawData['insertable'], 'id', number>[];
  }): Promise<TrainingTemplatesAggregationRaw | undefined> {
    const { exerciseTemplates, trainingTemplate } = data;
    const isExercisesEmpty = exerciseTemplates.length === 0;

    const raw = await this.kyselyService.db.transaction().execute(async (transaction) => {
      const result = await transaction
        .insertInto('trainings_templates')
        .values(trainingTemplate)
        .returningAll()
        .executeTakeFirstOrThrow();

      if (!isExercisesEmpty) {
        await transaction
          .insertInto('trainings_exercises_templates')
          .values(
            exerciseTemplates.map((i, index) => ({
              exercise_template_id: i.id,
              training_template_id: result.id,
              order: index,
            })),
          )
          .executeTakeFirstOrThrow();
      }

      return result;
    });

    if (isExercisesEmpty) {
      return {
        trainingTemplate: raw,
        exercises: [],
      };
    }

    return await this.findTrainingTemplateAggregationRelations({ templateId: raw.id });
  }

  async updateTrainingTemplateAggregation(
    data: {
      trainingTemplate: Override<TrainingTemplateRawData['insertable'], 'id', number>;
      exerciseTemplates: Override<ExerciseTemplateRawData['insertable'], 'id', number>[];
    },
    options: { replace: boolean } = { replace: false },
  ): Promise<TrainingTemplatesAggregationRaw | undefined> {
    const { replace } = options;
    const { exerciseTemplates, trainingTemplate } = data;
    const isExercisesEmpty = exerciseTemplates.length === 0;

    const raw = await this.kyselyService.db.transaction().execute(async (transaction) => {
      const { id, name, user_id, type, description, worm_up_duration, post_training_duration } =
        trainingTemplate;

      const result = await transaction
        .updateTable('trainings_templates')
        .where('trainings_templates.id', '=', trainingTemplate.id)
        .set({
          id,
          name,
          type,
          user_id,
          description: description ?? (replace ? null : undefined),
          worm_up_duration: worm_up_duration ?? (replace ? null : undefined),
          post_training_duration: post_training_duration ?? (replace ? null : undefined),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      await this.deleteExerciseTemplatesRelations(trainingTemplate.id);

      if (isExercisesEmpty) {
        return result;
      }

      await transaction
        .insertInto('trainings_exercises_templates')
        .values(
          exerciseTemplates.map((i, index) => ({
            exercise_template_id: i.id,
            training_template_id: result.id,
            order: index,
          })),
        )
        .execute();

      return result;
    });

    if (isExercisesEmpty) {
      return {
        trainingTemplate: raw,
        exercises: [],
      };
    }

    return await this.findTrainingTemplateAggregationRelations(
      { templateId: raw.id },
      { exerciseOrder: 'asc' },
    );
  }

  async getAllTrainingTemplateAggregation(
    filters: {
      userId?: number;
    },
    options?: { order: 'asc' | 'desc'; exerciseOrder: 'asc' | 'desc' },
  ): Promise<TrainingTemplatesAggregationRaw[] | undefined> {
    const { order = 'desc', exerciseOrder = 'desc' } = options ?? {};

    let query = this.getAllTemplateRelationsQuery()
      .orderBy('trainings_templates.updated_at', order)
      .orderBy('many_to_many_table.order', exerciseOrder);

    if (filters.userId != null) {
      query = query.where('trainings_templates.user_id', '=', filters.userId);
    }

    const result = await query.execute();
    if (result.length == 0) return undefined;

    const hashMap = new Map<number, Awaited<typeof result>>();
    for (const item of result) {
      if (hashMap.has(item.template_id)) {
        hashMap.get(item.template_id)?.push(item);
      } else {
        hashMap.set(item.template_id, [item]);
      }
    }

    return Array.from(hashMap.values()).reduce<TrainingTemplatesAggregationRaw[]>((acc, item) => {
      acc.push(
        this.mapper.trainingTemplateToPersistence({
          template: item[0],
          exercises: item,
        }),
      );
      return acc;
    }, []);
  }

  async findTrainingTemplateAggregationRelations(
    filters: {
      templateId: number;
    },
    options?: { order?: 'asc' | 'desc'; exerciseOrder?: 'asc' | 'desc' },
  ): Promise<TrainingTemplatesAggregationRaw | undefined> {
    const { order = 'desc', exerciseOrder = 'desc' } = options ?? {};

    const result = await this.getAllTemplateRelationsQuery()
      .where('trainings_templates.id', '=', filters?.templateId)
      .orderBy('trainings_templates.updated_at', order)
      .orderBy('many_to_many_table.order', exerciseOrder)
      .execute();

    if (result.length == 0) return undefined;

    return this.mapper.trainingTemplateToPersistence({ template: result[0], exercises: result });
  }

  async deleteExerciseTemplatesRelations(trainingTemplateId: number) {
    const result = await this.kyselyService.db
      .deleteFrom('trainings_exercises_templates')
      .where('training_template_id', '=', trainingTemplateId)
      .executeTakeFirst();
    return result.numDeletedRows > 0;
  }

  async findRawExerciseTemplates(
    exerciseId: number,
  ): Promise<ExerciseTemplateRawData['selectable']> {
    const rawExerciseTemplate = await this.exercisesTemplatesRepository.findOneById({
      id: exerciseId,
    });
    if (rawExerciseTemplate == null) {
      throw new NotFoundException(`Exercise template with id: ${exerciseId} is not found`);
    }
    return rawExerciseTemplate;
  }

  private getAllTemplateRelationsQuery() {
    return this.kyselyService.db
      .selectFrom('trainings_templates')
      .leftJoin(
        'trainings_exercises_templates as many_to_many_table',
        'trainings_templates.id',
        'many_to_many_table.training_template_id',
      )
      .leftJoin(
        'exercises_templates',
        'exercises_templates.id',
        'many_to_many_table.exercise_template_id',
      )
      .select([
        'trainings_templates.created_at as template_created_at',
        'trainings_templates.description as template_description',
        'trainings_templates.id as template_id',
        'trainings_templates.name as template_name',
        'trainings_templates.post_training_duration as template_post_training_duration',
        'trainings_templates.type as template_type',
        'trainings_templates.updated_at as template_updated_at',
        'trainings_templates.user_id as template_user_id',
        'trainings_templates.worm_up_duration as template_worm_up_duration',

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

  async test(id: number) {
    const raw = await this.kyselyService.db
      .selectFrom('trainings_templates')
      .leftJoin(
        'trainings_exercises_templates as many_to_many_table',
        'trainings_templates.id',
        'many_to_many_table.training_template_id',
      )
      .leftJoin(
        'exercises_templates',
        'exercises_templates.id',
        'many_to_many_table.exercise_template_id',
      )
      .select([
        'trainings_templates.created_at as template_created_at',
        'trainings_templates.description as template_description',
        'trainings_templates.id as template_id',
        'trainings_templates.name as template_name',
        'trainings_templates.post_training_duration as template_post_training_duration',
        'trainings_templates.type as template_type',
        'trainings_templates.updated_at as template_updated_at',
        'trainings_templates.user_id as template_user_id',
        'trainings_templates.worm_up_duration as template_worm_up_duration',

        'exercises_templates.created_at as exercise_created_at',
        'exercises_templates.description as exercise_description',
        'exercises_templates.id as exercise_id',
        'exercises_templates.name as exercise_name',
        'exercises_templates.type as exercise_type',
        'exercises_templates.updated_at as exercise_updated_at',
        'exercises_templates.user_id as exercise_user_id',
        'exercises_templates.example_url as exercise_example_url',
      ])
      .where('trainings_templates.id', '=', id)
      .execute();

    return raw;
  }

  private get mapper() {
    return {
      trainingTemplateToPersistence: (data: {
        template: {
          template_created_at: Date;
          template_description: string | null;
          template_id: number;
          template_name: string;
          template_post_training_duration: number | null;
          template_type: string;
          template_updated_at: Date;
          template_user_id: number | null;
          template_worm_up_duration: number | null;
        };
        exercises: {
          exercise_id: number | null;
          exercise_name: string | null;
          exercise_description: string | null;
          exercise_updated_at: Date | null;
          exercise_created_at: Date | null;
          exercise_type: string | null;
          exercise_user_id: number | null;
          exercise_example_url: string | null;
        }[];
      }): TrainingTemplatesAggregationRaw => {
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
            id: data.template.template_id,
            name: data.template.template_name,
            description: data.template.template_description,
            updated_at: data.template.template_updated_at,
            created_at: data.template.template_created_at,
            type: data.template.template_type,
            user_id: data.template.template_user_id,
            post_training_duration: data.template.template_post_training_duration,
            worm_up_duration: data.template.template_worm_up_duration,
          },
        };
      },
    };
  }
}
