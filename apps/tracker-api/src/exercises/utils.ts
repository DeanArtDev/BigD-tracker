import { ExerciseTemplateDto } from '@/exercises/dtos/exercise-template.dto';
import { ExerciseType } from './entity/exercise.entity';
import { ExerciseDto } from './dtos/exercise.dto';

const mapRawExerciseToDto = (data: {
  description: string | null;
  type: string;
  created_at: Date;
  updated_at: Date;
  example_url: string | null;
  id: number;
  name: string;
  training_id: number;
  user_id: number;
}): ExerciseDto => {
  return {
    description: data.description ?? undefined,
    type: data.type as ExerciseType,
    createdAt: data.created_at.toISOString(),
    updatedAt: data.updated_at.toISOString(),
    exampleUrl: data.example_url ?? undefined,
    id: data.id,
    name: data.name,
    trainingId: data.training_id,
    userId: data.user_id,
  };
};

const mapRawExerciseTemplateToDto = (data: {
  description: string | null;
  type: string;
  created_at: Date;
  updated_at: Date;
  example_url: string | null;
  id: number;
  name: string;
  user_id: number | null;
}): ExerciseTemplateDto => {
  return {
    description: data.description ?? undefined,
    type: data.type as ExerciseType,
    createdAt: data.created_at.toISOString(),
    updatedAt: data.updated_at.toISOString(),
    exampleUrl: data.example_url ?? undefined,
    id: data.id,
    name: data.name,
    userId: data.user_id ?? undefined,
  };
};

export { mapRawExerciseToDto, mapRawExerciseTemplateToDto };
