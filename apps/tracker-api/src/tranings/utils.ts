import { TrainingTemplateDto } from './dtos/get-trainings-templates.dto';
import { TrainingDto, TrainingType } from './dtos/training.dto';

const mapRowTrainingToDto = (data: {
  id: number;
  user_id: number;
  description: string | null;
  type: string;
  created_at: Date;
  end_date: Date | null;
  name: string;
  post_training_duration: number | null;
  start_date: Date | null;
  updated_at: Date;
  worm_up_duration: number | null;
}): TrainingDto => {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    type: data.type as TrainingType,
    description: data.description ?? undefined,
    startDate: data.start_date ?? undefined,
    endDate: data.end_date ?? undefined,
    wormUpDuration: data.worm_up_duration ?? undefined,
    postTrainingDuration: data.post_training_duration ?? undefined,
    createdAt: data.created_at,
  };
};

const mapRowTrainingTemplateToDto = (data: {
  id: number;
  user_id: number;
  description: string | null;
  type: string;
  created_at: Date;
  end_date: Date | null;
  name: string;
  post_training_duration: number | null;
  start_date: Date | null;
  updated_at: Date;
  worm_up_duration: number | null;
}): TrainingTemplateDto => {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    type: data.type as TrainingType,
    description: data.description ?? undefined,
    wormUpDuration: data.worm_up_duration ?? undefined,
    postTrainingDuration: data.post_training_duration ?? undefined,
    createdAt: data.created_at,
  };
};

export { mapRowTrainingToDto, mapRowTrainingTemplateToDto };
