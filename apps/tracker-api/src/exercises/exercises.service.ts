import { ExerciseType } from '@/exercises/dtos/exercise.dto';
import { TrainingsService } from '@/tranings/trainings.service';
import { UsersService } from '@/users/users.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Nullable } from 'kysely/dist/esm';
import { ExercisesRepository } from './exercises.repository';
import { ExercisesTemplatesRepository } from './exercises-templates.repository';

@Injectable()
export class ExercisesService {
  constructor(
    readonly exercisesRepository: ExercisesRepository,
    readonly exercisesTemplatesRepository: ExercisesTemplatesRepository,
    readonly userService: UsersService,
    readonly trainingsService: TrainingsService,
  ) {}

  async getExercisesTemplates(filters: { userId?: number }) {
    return await this.exercisesTemplatesRepository.findByFilters(filters);
  }

  async getExercises(filters: { userId?: number; trainingId?: number }) {
    return await this.exercisesRepository.findExercisesByFilters(filters);
  }

  async createExercise(data: {
    name: string;
    userId: number;
    trainingId: number;
    type: ExerciseType;
    description?: string;
    exampleUrl?: string;
  }) {
    await this.userService.findUser({ id: data.userId });
    await this.trainingsService.findTraining({ id: data.trainingId });
    const rowExercise = await this.exercisesRepository.create(data);
    if (rowExercise == null) {
      throw new InternalServerErrorException('Failed to create exercise');
    }
    return rowExercise;
  }

  async deleteExercise(id: number) {
    await this.findExercise({ id });
    return await this.exercisesRepository.delete(id);
  }

  async findExercise({ id }: { id: number }) {
    const rawExercise = await this.exercisesRepository.findOneById({ id });
    if (rawExercise == null) {
      throw new NotFoundException('Exercise is not found');
    }
    return rawExercise;
  }

  async updatePartly(
    id: number,
    data: {
      name?: string;
      type?: ExerciseType;
      userId?: number;
      trainingId?: number;
      exampleUrl?: string;
      description?: string;
    },
  ) {
    await this.findExercise({ id });
    const exercise = await this.exercisesRepository.updatePartly(id, data);
    if (exercise == null) {
      throw new InternalServerErrorException({ id }, { cause: 'Failed to update' });
    }
    return exercise;
  }

  async updateAndReplace(
    id: number,
    data: {
      name: string;
      type: ExerciseType;
      trainingId: number;
    } & Nullable<{
      exampleUrl: string;
      description: string;
    }>,
  ) {
    await this.trainingsService.findTraining({ id: data.trainingId });
    await this.findExercise({ id });
    const exercise = await this.exercisesRepository.updateAndReplace(id, data);
    if (exercise == null) {
      throw new InternalServerErrorException({ id }, { cause: 'Failed to update' });
    }
    return exercise;
  }

  // Templates

  async createExerciseTemplate(data: {
    userId?: number;
    name: string;
    description?: string;
    exampleUrl?: string;
    type: ExerciseType;
  }) {
    if (data.userId != null) {
      await this.userService.findUser({ id: data.userId });
    }

    const rowExercise = await this.exercisesTemplatesRepository.create(data);
    if (rowExercise == null) {
      throw new InternalServerErrorException('Failed to create exercise template');
    }
    return rowExercise;
  }

  async deleteExerciseTemplate(id: number) {
    await this.findExerciseTemplate({ id });
    return await this.exercisesTemplatesRepository.delete(id);
  }

  async findExerciseTemplate({ id }: { id: number }) {
    const rawExercise = await this.exercisesTemplatesRepository.findOneById({ id });
    if (rawExercise == null) {
      throw new NotFoundException('Exercise template is not found');
    }
    return rawExercise;
  }

  async updateTemplatePartly(
    id: number,
    data: {
      name?: string;
      type?: ExerciseType;
      exampleUrl?: string;
      description?: string;
    },
  ) {
    await this.findExerciseTemplate({ id });
    const exercise = await this.exercisesTemplatesRepository.updatePartly(id, data);
    if (exercise == null) {
      throw new InternalServerErrorException({ id }, { cause: 'Failed to update' });
    }
    return exercise;
  }

  async updateTemplateAndReplace(
    id: number,
    data: {
      name: string;
      type: ExerciseType;
    } & Nullable<{
      exampleUrl: string;
      description: string;
    }>,
  ) {
    await this.findExerciseTemplate({ id });
    const exercise = await this.exercisesTemplatesRepository.updateAndReplace(id, data);
    if (exercise == null) {
      throw new InternalServerErrorException({ id }, { cause: 'Failed to update' });
    }
    return exercise;
  }
}
